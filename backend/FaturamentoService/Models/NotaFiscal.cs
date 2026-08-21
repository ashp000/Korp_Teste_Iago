using System.ComponentModel.DataAnnotations;

namespace FaturamentoService.Models
{
    public enum StatusNotaFiscal
    {
        Aberta,
        Fechada
    }

    public class NotaFiscal
    {
        [Key]
        public int Id { get; set; }

        public int Numero { get; set; }

        public StatusNotaFiscal Status { get; set; } = StatusNotaFiscal.Aberta;

        public DateTime DataAbertura { get; set; } = DateTime.UtcNow;

        public DateTime? DataFechamento { get; set; }

        public List<NotaFiscalItem> Itens { get; set; } = new();
    }
}
