namespace EstoqueService.Dtos
{
    public record ProdutoResponse(int Id, string Codigo, string Descricao, int Saldo);

    public record CriarProdutoRequest(string Codigo, string Descricao, int Saldo);

    public record AtualizarProdutoRequest(string Descricao, int Saldo);

    public record BaixarSaldoItemRequest(int ProdutoId, int Quantidade);

    public record BaixarSaldoRequest(int NotaFiscalId, List<BaixarSaldoItemRequest> Itens);

    public record BaixarSaldoItemResultado(int ProdutoId, int Quantidade, bool JaProcessado);

    public record BaixarSaldoResponse(int NotaFiscalId, List<BaixarSaldoItemResultado> Itens);

    public record SugerirDescricaoRequest(string Codigo);

    public record SugerirDescricaoResponse(string Descricao);
}
