using System.ComponentModel.DataAnnotations;

namespace EstoqueService.Models
{
    public class MovimentacaoEstoque
    {
        [Key]
        public int Id { get; set; }

        public int ProdutoId { get; set; }

        public int NotaFiscalId { get; set; }

        // Identifica a linha da nota (não só o produto): permite que o mesmo produto apareça
        // em duas linhas de uma mesma nota, cada uma baixando estoque separadamente, sem que a
        // segunda seja confundida com um reenvio/retry da primeira pela checagem de idempotência.
        public int NotaFiscalItemId { get; set; }

        public int Quantidade { get; set; }

        public DateTime DataHora { get; set; }
    }
}
