using System.ComponentModel.DataAnnotations;

namespace FaturamentoService.Models
{
    public class NotaFiscalItem
    {
        [Key]
        public int Id { get; set; }

        public int NotaFiscalId { get; set; }

        public NotaFiscal? NotaFiscal { get; set; }

        public int ProdutoId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ProdutoCodigo { get; set; } = string.Empty;

        public int Quantidade { get; set; }
    }
}
