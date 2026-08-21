namespace FaturamentoService.Dtos
{
    public record ItemNotaFiscalRequest(int ProdutoId, string ProdutoCodigo, int Quantidade);

    public record CriarNotaFiscalRequest(List<ItemNotaFiscalRequest> Itens);

    public record AtualizarNotaFiscalRequest(List<ItemNotaFiscalRequest> Itens);

    public record ItemNotaFiscalResponse(int ProdutoId, string ProdutoCodigo, int Quantidade);

    public record NotaFiscalResponse(
        int Id,
        int Numero,
        string Status,
        DateTime DataAbertura,
        DateTime? DataFechamento,
        List<ItemNotaFiscalResponse> Itens);
}
