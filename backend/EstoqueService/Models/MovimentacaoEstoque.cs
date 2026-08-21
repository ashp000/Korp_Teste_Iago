using System.ComponentModel.DataAnnotations;

namespace EstoqueService.Models
{
    public class MovimentacaoEstoque
    {
        [Key]
        public int Id { get; set; }

        public int ProdutoId { get; set; }

        public int NotaFiscalId { get; set; }

        public int Quantidade { get; set; }

        public DateTime DataHora { get; set; }
    }
}
