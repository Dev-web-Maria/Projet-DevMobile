using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlloHonda.Data;
using AlloHonda.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace AlloHonda.Controllers
{
    [ApiController]
    [Route("api/AdminStats")]
    [AllowAnonymous] 
    public class AdminStatsController : ControllerBase
    {
        private readonly AlloHondaContext _context;

        public AdminStatsController(AlloHondaContext context)
        {
            _context = context;
        }

        [HttpGet("Overview")]
        public async Task<IActionResult> GetOverview()
        {
            try
            {
                var totalClients = await _context.Client.CountAsync();
                var totalChauffeurs = await _context.Chauffeur.CountAsync();
                var activeChauffeurs = await _context.Chauffeur.CountAsync(c => c.Statut == "Disponible");
                
                var topDemandes = await _context.DemandeTransport.ToListAsync();
                var totalDemandes = topDemandes.Count;
                var missionsEnCours = topDemandes.Count(d => d.Statut == "EN_COURS");
                var totalRevenue = topDemandes.Where(d => d.Statut == "TERMINEE").Sum(d => d.PrixEstime);

                return Ok(new
                {
                    totalClients,
                    totalChauffeurs,
                    activeChauffeurs,
                    totalDemandes,
                    missionsEnCours,
                    totalRevenue
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Erreur lors de la récupération des stats", details = ex.Message });
            }
        }

        [HttpGet("Clients")]
        public async Task<IActionResult> GetAllClients()
        {
            try
            {
                var clients = await _context.Client
                    .Include(c => c.ApplicationUser)
                    .Select(c => new
                    {
                        id = c.IdClient,
                        nom = c.ApplicationUser.Nom,
                        prenom = c.ApplicationUser.Prenom,
                        email = c.ApplicationUser.Email,
                        telephone = c.ApplicationUser.Telephone,
                        ville = c.ApplicationUser.Ville
                    })
                    .ToListAsync();

                return Ok(clients);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Erreur lors de la récupération des clients", details = ex.Message });
            }
        }
    }
}
