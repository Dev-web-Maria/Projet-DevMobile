using Microsoft.EntityFrameworkCore;
using AlloHanda.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using AlloHonda.Models;
using Microsoft.AspNetCore.Identity;

namespace AlloHonda.Data
{
    public class AlloHondaContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
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

            // Configuration de la relation Client - ApplicationUser
            modelBuilder.Entity<Client>()
                .HasOne(c => c.ApplicationUser)
                .WithOne(u => u.Client)
                .HasForeignKey<Client>(c => c.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuration de la relation Chauffeur - ApplicationUser
            modelBuilder.Entity<Chauffeur>()
                .HasOne(c => c.ApplicationUser)
                .WithOne(u => u.Chauffeur)
                .HasForeignKey<Chauffeur>(c => c.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}