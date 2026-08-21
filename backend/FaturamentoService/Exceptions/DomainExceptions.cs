namespace FaturamentoService.Exceptions
{
    public class NotaFiscalNaoEncontradaException : Exception
    {
        public NotaFiscalNaoEncontradaException(int id) : base($"Nota fiscal {id} não encontrada.") { }
    }

    public class NotaFiscalJaFechadaException : Exception
    {
        public NotaFiscalJaFechadaException(int id) : base($"Nota fiscal {id} já está fechada. Só é possível imprimir notas abertas.") { }
    }

    public class NotaFiscalSemItensException : Exception
    {
        public NotaFiscalSemItensException(int id) : base($"Nota fiscal {id} precisa ter pelo menos um item.") { }
    }

    public class SaldoInsuficienteException : Exception
    {
        public SaldoInsuficienteException(string mensagem) : base(mensagem) { }
    }

    public class EstoqueIndisponivelException : Exception
    {
        public EstoqueIndisponivelException(string mensagem) : base(mensagem) { }
    }
}
