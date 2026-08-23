using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EstoqueService.Migrations
{
    /// <inheritdoc />
    public partial class AddNotaFiscalItemIdToMovimentacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Movimentacoes_NotaFiscalId_ProdutoId",
                table: "Movimentacoes");

            // Movimentacoes é só um livro-razão interno de idempotência (não afeta o Saldo já
            // gravado em Produtos, nem pode reabrir uma nota já Fechada) — zera aqui pra evitar
            // colisão do novo índice único com linhas antigas que ainda não tinham NotaFiscalItemId.
            migrationBuilder.Sql("DELETE FROM \"Movimentacoes\";");

            migrationBuilder.AddColumn<int>(
                name: "NotaFiscalItemId",
                table: "Movimentacoes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Movimentacoes_NotaFiscalId_NotaFiscalItemId",
                table: "Movimentacoes",
                columns: new[] { "NotaFiscalId", "NotaFiscalItemId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Movimentacoes_NotaFiscalId_NotaFiscalItemId",
                table: "Movimentacoes");

            migrationBuilder.DropColumn(
                name: "NotaFiscalItemId",
                table: "Movimentacoes");

            migrationBuilder.CreateIndex(
                name: "IX_Movimentacoes_NotaFiscalId_ProdutoId",
                table: "Movimentacoes",
                columns: new[] { "NotaFiscalId", "ProdutoId" },
                unique: true);
        }
    }
}
