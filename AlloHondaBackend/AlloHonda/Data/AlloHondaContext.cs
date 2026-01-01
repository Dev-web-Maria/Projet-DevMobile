using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using AlloHonda.Models;

namespace AlloHonda.Data
{
    public class AlloHondaContext
        : IdentityDbContext<ApplicationUser, IdentityRole, string>
    {
        public AlloHondaContext(DbContextOptions<AlloHondaContext> options)
            : base(options)
        {
        }

        public DbSet<Client> Client { get; set; } = default!;
        public DbSet<Chauffeur> Chauffeur { get; set; } = default!;
        public DbSet<Vehicule> Vehicule { get; set; } = default!;
        public DbSet<DemandeTransport> DemandeTransport { get; set; } = default!;
        public DbSet<Trajet> Trajet { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Client <-> ApplicationUser
            modelBuilder.Entity<Client>()
                .HasOne(c => c.ApplicationUser)
                .WithOne(u => u.Client)
                .HasForeignKey<Client>(c => c.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Chauffeur <-> ApplicationUser
            modelBuilder.Entity<Chauffeur>()
                .HasOne(c => c.ApplicationUser)
                .WithOne(u => u.Chauffeur)
                .HasForeignKey<Chauffeur>(c => c.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuration pour DemandeTransport
            modelBuilder.Entity<DemandeTransport>(entity =>
            {
                entity.HasOne(d => d.Client)
                    .WithMany(c => c.Demandes)
                    .HasForeignKey(d => d.ClientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Chauffeur)
                    .WithMany(c => c.DemandesAcceptees)
                    .HasForeignKey(d => d.ChauffeurId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                entity.HasOne(d => d.Trajet)
                    .WithOne(t => t.DemandeTransport)
                    .HasForeignKey<Trajet>(t => t.DemandeTransportId)
                    .IsRequired(false);
            });

            // Vehicule <-> Chauffeur
            modelBuilder.Entity<Vehicule>()
                .HasOne(v => v.Chauffeur)
                .WithOne(c => c.Vehicule)
                .HasForeignKey<Vehicule>(v => v.ChauffeurId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
