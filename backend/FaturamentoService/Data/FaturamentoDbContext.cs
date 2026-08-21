using FaturamentoService.Models;
using Microsoft.EntityFrameworkCore;

namespace FaturamentoService.Data
{
    public class FaturamentoDbContext : DbContext
    {
        public FaturamentoDbContext(DbContextOptions<FaturamentoDbContext> options)
            : base(options)
        {
        }

        public DbSet<NotaFiscal> NotasFiscais { get; set; }

        public DbSet<NotaFiscalItem> Itens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Sequence nativa do Postgres para a numeracao: nextval() e atomico,
            // sem race condition mesmo com duas notas sendo criadas ao mesmo tempo.
            modelBuilder.HasSequence<int>("nota_numero_seq").StartsAt(1).IncrementsBy(1);

            modelBuilder.Entity<NotaFiscal>(entity =>
            {
                entity.Property(n => n.Status).HasConversion<string>();

                entity.Property(n => n.Numero)
                    .HasDefaultValueSql("nextval('nota_numero_seq')");

                entity.HasIndex(n => n.Numero).IsUnique();

                entity.HasMany(n => n.Itens)
                    .WithOne(i => i.NotaFiscal!)
                    .HasForeignKey(i => i.NotaFiscalId);
            });
        }
    }
}
