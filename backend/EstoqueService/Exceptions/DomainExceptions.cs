namespace EstoqueService.Exceptions
{
    public class ProdutoNaoEncontradoException : Exception
    {
        public ProdutoNaoEncontradoException(int produtoId) : base($"Produto {produtoId} não encontrado.") { }
    }

    public class CodigoDuplicadoException : Exception
    {
        public CodigoDuplicadoException(string codigo) : base($"Já existe um produto com o código '{codigo}'.") { }
    }

    public class ProdutoEmUsoException : Exception
    {
        public ProdutoEmUsoException(string codigo) : base($"Produto '{codigo}' já foi usado em notas fiscais e não pode ser excluído.") { }
    }

    public class SaldoInsuficienteException : Exception
    {
        public int ProdutoId { get; }
        public string Codigo { get; }
        public int QuantidadeSolicitada { get; }
        public int SaldoDisponivel { get; }

        public SaldoInsuficienteException(int produtoId, string codigo, int quantidadeSolicitada, int saldoDisponivel)
            : base($"Saldo insuficiente para o produto '{codigo}': solicitado {quantidadeSolicitada}, disponível {saldoDisponivel}.")
        {
            ProdutoId = produtoId;
            Codigo = codigo;
            QuantidadeSolicitada = quantidadeSolicitada;
            SaldoDisponivel = saldoDisponivel;
        }
    }
}
