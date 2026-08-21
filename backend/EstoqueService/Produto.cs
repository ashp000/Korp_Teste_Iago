using System.ComponentModel.DataAnnotations;

namespace EstoqueService.Models
{
    public class Produto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Codigo { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        public int Saldo { get; set; }
    }
}