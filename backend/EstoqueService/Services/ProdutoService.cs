using EstoqueService.Data;
using EstoqueService.Dtos;
using EstoqueService.Exceptions;
using EstoqueService.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace EstoqueService.Services
{
    public interface IProdutoService
    {
        Task<List<ProdutoResponse>> ListarAsync();
        Task<ProdutoResponse> ObterAsync(int id);
        Task<ProdutoResponse> CriarAsync(CriarProdutoRequest request);
        Task<ProdutoResponse> AtualizarAsync(int id, AtualizarProdutoRequest request);
        Task ExcluirAsync(int id);
        Task<BaixarSaldoResponse> BaixarSaldoAsync(BaixarSaldoRequest request);
    }

    public class ProdutoService : IProdutoService
    {
        private readonly EstoqueDbContext _db;

        public ProdutoService(EstoqueDbContext db)
        {
            _db = db;
        }

        public async Task<List<ProdutoResponse>> ListarAsync() =>
            await _db.Produtos
                .OrderBy(p => p.Codigo)
                .Select(p => new ProdutoResponse(p.Id, p.Codigo, p.Descricao, p.Saldo))
                .ToListAsync();

        public async Task<ProdutoResponse> ObterAsync(int id)
        {
            var produto = await _db.Produtos.FindAsync(id) ?? throw new ProdutoNaoEncontradoException(id);
            return new ProdutoResponse(produto.Id, produto.Codigo, produto.Descricao, produto.Saldo);
        }

        public async Task<ProdutoResponse> CriarAsync(CriarProdutoRequest request)
        {
            if (await _db.Produtos.AnyAsync(p => p.Codigo == request.Codigo))
                throw new CodigoDuplicadoException(request.Codigo);

            var produto = new Produto
            {
                Codigo = request.Codigo,
                Descricao = request.Descricao,
                Saldo = request.Saldo
            };

            _db.Produtos.Add(produto);
            await _db.SaveChangesAsync();

            return new ProdutoResponse(produto.Id, produto.Codigo, produto.Descricao, produto.Saldo);
        }

        public async Task<ProdutoResponse> AtualizarAsync(int id, AtualizarProdutoRequest request)
        {
            var produto = await _db.Produtos.FindAsync(id) ?? throw new ProdutoNaoEncontradoException(id);

            produto.Descricao = request.Descricao;
            produto.Saldo = request.Saldo;
            await _db.SaveChangesAsync();

            return new ProdutoResponse(produto.Id, produto.Codigo, produto.Descricao, produto.Saldo);
        }

        // Excluir é bloqueado se o produto já aparece em alguma MovimentacaoEstoque: apagar um
        // produto com histórico quebraria a rastreabilidade das notas fiscais que já o usaram.
        public async Task ExcluirAsync(int id)
        {
            var produto = await _db.Produtos.FindAsync(id) ?? throw new ProdutoNaoEncontradoException(id);

            var emUso = await _db.Movimentacoes.AnyAsync(m => m.ProdutoId == id);
            if (emUso)
                throw new ProdutoEmUsoException(produto.Codigo);

            _db.Produtos.Remove(produto);
            await _db.SaveChangesAsync();
        }

        // Decremento atômico via ExecuteUpdateAsync (UPDATE ... WHERE Saldo >= qty no próprio banco,
        // sem carregar a entidade) + registro de MovimentacaoEstoque com índice único em
        // (NotaFiscalId, ProdutoId): isso resolve concorrência (duas notas disputando o último saldo,
        // só uma linha é afetada) e idempotência (reenvio da mesma nota não decrementa de novo) juntos.
        public async Task<BaixarSaldoResponse> BaixarSaldoAsync(BaixarSaldoRequest request)
        {
            var jaProcessados = await _db.Movimentacoes
                .Where(m => m.NotaFiscalId == request.NotaFiscalId)
                .Select(m => m.ProdutoId)
                .ToListAsync();

            var resultados = new List<BaixarSaldoItemResultado>();

            foreach (var item in request.Itens.Where(i => jaProcessados.Contains(i.ProdutoId)))
                resultados.Add(new BaixarSaldoItemResultado(item.ProdutoId, item.Quantidade, JaProcessado: true));

            var pendentes = request.Itens.Where(i => !jaProcessados.Contains(i.ProdutoId)).ToList();
            if (pendentes.Count == 0)
                return new BaixarSaldoResponse(request.NotaFiscalId, resultados);

            await using var transacao = await _db.Database.BeginTransactionAsync();

            foreach (var item in pendentes)
            {
                var linhasAfetadas = await _db.Produtos
                    .Where(p => p.Id == item.ProdutoId && p.Saldo >= item.Quantidade)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Saldo, p => p.Saldo - item.Quantidade));

                if (linhasAfetadas == 0)
                {
                    var produtoFaltante = await _db.Produtos.FindAsync(item.ProdutoId);
                    if (produtoFaltante is null)
                        throw new ProdutoNaoEncontradoException(item.ProdutoId);
                    throw new SaldoInsuficienteException(item.ProdutoId, produtoFaltante.Codigo, item.Quantidade, produtoFaltante.Saldo);
                }

                _db.Movimentacoes.Add(new MovimentacaoEstoque
                {
                    ProdutoId = item.ProdutoId,
                    NotaFiscalId = request.NotaFiscalId,
                    Quantidade = item.Quantidade,
                    DataHora = DateTime.UtcNow
                });

                try
                {
                    await _db.SaveChangesAsync();
                }
                catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
                {
                    // Corrida entre duas tentativas concorrentes da mesma nota: a outra chegou primeiro.
                    // Desfaz o decremento que acabamos de aplicar e trata como já processado (idempotente).
                    _db.ChangeTracker.Clear();
                    await _db.Produtos
                        .Where(p => p.Id == item.ProdutoId)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.Saldo, p => p.Saldo + item.Quantidade));
                    resultados.Add(new BaixarSaldoItemResultado(item.ProdutoId, item.Quantidade, JaProcessado: true));
                    continue;
                }

                resultados.Add(new BaixarSaldoItemResultado(item.ProdutoId, item.Quantidade, JaProcessado: false));
            }

            await transacao.CommitAsync();
            return new BaixarSaldoResponse(request.NotaFiscalId, resultados);
        }
    }
}
