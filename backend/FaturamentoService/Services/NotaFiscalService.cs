using FaturamentoService.Clients;
using FaturamentoService.Data;
using FaturamentoService.Dtos;
using FaturamentoService.Exceptions;
using FaturamentoService.Models;
using Microsoft.EntityFrameworkCore;

namespace FaturamentoService.Services
{
    public interface INotaFiscalService
    {
        Task<List<NotaFiscalResponse>> ListarAsync();
        Task<NotaFiscalResponse> ObterAsync(int id);
        Task<NotaFiscalResponse> CriarAsync(CriarNotaFiscalRequest request);
        Task<NotaFiscalResponse> AtualizarItensAsync(int id, AtualizarNotaFiscalRequest request);
        Task<NotaFiscalResponse> ImprimirAsync(int id);
    }

    public class NotaFiscalService : INotaFiscalService
    {
        private readonly FaturamentoDbContext _db;
        private readonly IEstoqueClient _estoqueClient;

        public NotaFiscalService(FaturamentoDbContext db, IEstoqueClient estoqueClient)
        {
            _db = db;
            _estoqueClient = estoqueClient;
        }

        public async Task<List<NotaFiscalResponse>> ListarAsync()
        {
            var notas = await _db.NotasFiscais
                .Include(n => n.Itens)
                .OrderByDescending(n => n.Numero)
                .ToListAsync();

            return notas.Select(MapToResponse).ToList();
        }

        public async Task<NotaFiscalResponse> ObterAsync(int id)
        {
            var nota = await BuscarNotaAsync(id);
            return MapToResponse(nota);
        }

        public async Task<NotaFiscalResponse> CriarAsync(CriarNotaFiscalRequest request)
        {
            var nota = new NotaFiscal
            {
                Status = StatusNotaFiscal.Aberta,
                DataAbertura = DateTime.UtcNow,
                Itens = request.Itens.Select(i => new NotaFiscalItem
                {
                    ProdutoId = i.ProdutoId,
                    ProdutoCodigo = i.ProdutoCodigo,
                    Quantidade = i.Quantidade
                }).ToList()
            };

            _db.NotasFiscais.Add(nota);
            await _db.SaveChangesAsync();

            return MapToResponse(nota);
        }

        // Só permite editar os itens enquanto a nota está Aberta — depois de Fechada, os itens
        // já viraram baixa de estoque de verdade e não podem mudar retroativamente.
        public async Task<NotaFiscalResponse> AtualizarItensAsync(int id, AtualizarNotaFiscalRequest request)
        {
            var nota = await BuscarNotaAsync(id);

            if (nota.Status != StatusNotaFiscal.Aberta)
                throw new NotaFiscalJaFechadaException(id);

            if (request.Itens.Count == 0)
                throw new NotaFiscalSemItensException(id);

            _db.Itens.RemoveRange(nota.Itens);
            nota.Itens = request.Itens.Select(i => new NotaFiscalItem
            {
                ProdutoId = i.ProdutoId,
                ProdutoCodigo = i.ProdutoCodigo,
                Quantidade = i.Quantidade
            }).ToList();

            await _db.SaveChangesAsync();
            return MapToResponse(nota);
        }

        // Só imprime se estiver Aberta (também cobre clique duplo / retry do frontend: a segunda
        // chamada encontra Status == Fechada e recusa antes de chamar o Estoque de novo). Se o
        // EstoqueService estiver fora do ar, a exceção sobe como 503 e a nota permanece Aberta,
        // pronta para uma nova tentativa.
        public async Task<NotaFiscalResponse> ImprimirAsync(int id)
        {
            var nota = await BuscarNotaAsync(id);

            if (nota.Status != StatusNotaFiscal.Aberta)
                throw new NotaFiscalJaFechadaException(id);

            await _estoqueClient.BaixarSaldoAsync(new BaixarSaldoRequest(
                nota.Id,
                nota.Itens.Select(i => new BaixarSaldoItemRequest(i.ProdutoId, i.Quantidade)).ToList()));

            nota.Status = StatusNotaFiscal.Fechada;
            nota.DataFechamento = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return MapToResponse(nota);
        }

        private async Task<NotaFiscal> BuscarNotaAsync(int id) =>
            await _db.NotasFiscais.Include(n => n.Itens).FirstOrDefaultAsync(n => n.Id == id)
                ?? throw new NotaFiscalNaoEncontradaException(id);

        private static NotaFiscalResponse MapToResponse(NotaFiscal nota) => new(
            nota.Id,
            nota.Numero,
            nota.Status.ToString(),
            nota.DataAbertura,
            nota.DataFechamento,
            nota.Itens.Select(i => new ItemNotaFiscalResponse(i.ProdutoId, i.ProdutoCodigo, i.Quantidade)).ToList());
    }
}
