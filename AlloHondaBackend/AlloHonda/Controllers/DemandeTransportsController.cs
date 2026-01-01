using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlloHonda.Data;
using AlloHonda.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AlloHonda.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DemandeTransportsController : ControllerBase
    {
        private readonly AlloHondaContext _context;

        public DemandeTransportsController(AlloHondaContext context)
        {
            _context = context;
        }

        // GET: api/DemandeTransports
        [HttpGet]
        public async Task<ActionResult<object>> GetAll()
        {
            var demandes = await _context.DemandeTransport
                .Include(d => d.Client)
                    .ThenInclude(c => c.ApplicationUser)
                .Include(d => d.Chauffeur)
                    .ThenInclude(ch => ch.ApplicationUser)
                .Include(d => d.Trajet)
                .Select(d => new
                {
                    idDemande = d.IdDemande,
                    depart = d.Depart,
                    arrivee = d.Arrivee,
                    typeMarchandise = d.TypeMarchandise,
                    descriptionMarchandise = d.DescriptionMarchandise,
                    poids = d.Poids,
                    volume = d.Volume,
                    dateDepart = d.DateDepart,
                    heureDepart = d.HeureDepart,
                    instructions = d.Instructions,
                    statut = d.Statut,
                    prixEstime = d.PrixEstime,
                    clientId = d.ClientId,
                    chauffeurId = d.ChauffeurId,
                    client = d.Client != null ? new
                    {
                        idClient = d.Client.IdClient,
                        nom = d.Client.ApplicationUser != null ? d.Client.ApplicationUser.Nom : null,
                        prenom = d.Client.ApplicationUser != null ? d.Client.ApplicationUser.Prenom : null
                    } : null,
                    chauffeur = d.Chauffeur != null ? new
                    {
                        idChauffeur = d.Chauffeur.IdChauffeur,
                        statut = d.Chauffeur.Statut,
                        nom = d.Chauffeur.ApplicationUser != null ? d.Chauffeur.ApplicationUser.Nom : null,
                        prenom = d.Chauffeur.ApplicationUser != null ? d.Chauffeur.ApplicationUser.Prenom : null
                    } : null,
                    trajet = d.Trajet != null ? new
                    {
                        idTrajet = d.Trajet.IdTrajet,
                        adresseDepart = d.Trajet.AdresseDepart,
                        adresseArrivee = d.Trajet.AdresseArrivee,
                        distance = d.Trajet.Distance,
                        dureeEstimee = d.Trajet.DureeEstimee
                    } : null
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                count = demandes.Count,
                demandes = demandes
            });
        }

        // GET: api/DemandeTransports/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetById(int id)
        {
            var demandeTransport = await _context.DemandeTransport
                .Include(d => d.Client)
                    .ThenInclude(c => c.ApplicationUser)
                .Include(d => d.Chauffeur)
                    .ThenInclude(ch => ch.ApplicationUser)
                .Include(d => d.Trajet)
                .FirstOrDefaultAsync(d => d.IdDemande == id);

            if (demandeTransport == null)
                return NotFound(new { success = false, message = "Demande non trouvée" });

            var result = new
            {
                idDemande = demandeTransport.IdDemande,
                depart = demandeTransport.Depart,
                arrivee = demandeTransport.Arrivee,
                typeMarchandise = demandeTransport.TypeMarchandise,
                descriptionMarchandise = demandeTransport.DescriptionMarchandise,
                poids = demandeTransport.Poids,
                volume = demandeTransport.Volume,
                dateDepart = demandeTransport.DateDepart,
                heureDepart = demandeTransport.HeureDepart,
                instructions = demandeTransport.Instructions,
                statut = demandeTransport.Statut,
                prixEstime = demandeTransport.PrixEstime,
                clientId = demandeTransport.ClientId,
                chauffeurId = demandeTransport.ChauffeurId,
                client = demandeTransport.Client != null ? new
                {
                    idClient = demandeTransport.Client.IdClient,
                    nom = demandeTransport.Client.ApplicationUser != null ? demandeTransport.Client.ApplicationUser.Nom : null,
                    prenom = demandeTransport.Client.ApplicationUser != null ? demandeTransport.Client.ApplicationUser.Prenom : null,
                    telephone = demandeTransport.Client.ApplicationUser != null ? demandeTransport.Client.ApplicationUser.Telephone : null,
                    email = demandeTransport.Client.ApplicationUser != null ? demandeTransport.Client.ApplicationUser.Email : null
                } : null,
                chauffeur = demandeTransport.Chauffeur != null ? new
                {
                    idChauffeur = demandeTransport.Chauffeur.IdChauffeur,
                    statut = demandeTransport.Chauffeur.Statut,
                    nom = demandeTransport.Chauffeur.ApplicationUser != null ? demandeTransport.Chauffeur.ApplicationUser.Nom : null,
                    prenom = demandeTransport.Chauffeur.ApplicationUser != null ? demandeTransport.Chauffeur.ApplicationUser.Prenom : null,
                    telephone = demandeTransport.Chauffeur.ApplicationUser != null ? demandeTransport.Chauffeur.ApplicationUser.Telephone : null
                } : null,
                trajet = demandeTransport.Trajet != null ? new
                {
                    idTrajet = demandeTransport.Trajet.IdTrajet,
                    adresseDepart = demandeTransport.Trajet.AdresseDepart,
                    adresseArrivee = demandeTransport.Trajet.AdresseArrivee,
                    distance = demandeTransport.Trajet.Distance,
                    dureeEstimee = demandeTransport.Trajet.DureeEstimee
                } : null
            };

            return Ok(new { success = true, demande = result });
        }

        public class CreateDemandeRequest
        {
            public string Depart { get; set; }
            public string Arrivee { get; set; }
            public string TypeMarchandise { get; set; }
            public string DescriptionMarchandise { get; set; }
            public double Poids { get; set; }
            public double Volume { get; set; }
            public DateTime DateDepart { get; set; }
            public string HeureDepart { get; set; }
            public string Instructions { get; set; }
            public double PrixEstime { get; set; }
            public int ClientId { get; set; } 
        }

        [HttpPost]
        public async Task<ActionResult<object>> Create([FromBody] CreateDemandeRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Depart))
                    return BadRequest(new { success = false, message = "Le lieu de départ est requis" });

                if (string.IsNullOrWhiteSpace(request.Arrivee))
                    return BadRequest(new { success = false, message = "Le lieu d'arrivée est requis" });

                if (request.Poids <= 0)
                    return BadRequest(new { success = false, message = "Le poids doit être supérieur à 0" });

                if (request.ClientId <= 0)
                    return BadRequest(new { success = false, message = "Le client ID est requis" });

                var client = await _context.Client
                    .FirstOrDefaultAsync(c => c.IdClient == request.ClientId);

                if (client == null)
                    return NotFound(new { success = false, message = "Client non trouvé" });

                var demandeTransport = new DemandeTransport
                {
                    Depart = request.Depart,
                    Arrivee = request.Arrivee,
                    TypeMarchandise = request.TypeMarchandise,
                    DescriptionMarchandise = request.DescriptionMarchandise ?? $"Transport {request.TypeMarchandise}",
                    Poids = request.Poids,
                    Volume = request.Volume,
                    DateDepart = request.DateDepart,
                    HeureDepart = string.IsNullOrWhiteSpace(request.HeureDepart) ? "09:00" : request.HeureDepart,
                    Instructions = request.Instructions ?? "",
                    Statut = "EN_ATTENTE",
                    PrixEstime = request.PrixEstime > 0 ? request.PrixEstime : CalculateEstimatedPrice(request),
                    ClientId = client.IdClient,
                    ChauffeurId = null
                };

                _context.DemandeTransport.Add(demandeTransport);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Demande créée avec succès",
                    idDemande = demandeTransport.IdDemande
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Erreur interne", error = ex.Message });
            }
        }

        private double CalculateEstimatedPrice(CreateDemandeRequest demande)
        {
            double basePrice = 50.0 + (demande.Poids * 2) + (demande.Volume * 30);
            return Math.Round(basePrice, 2);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<object>> Update(int id, [FromBody] UpdateDemandeRequest request)
        {
            var demande = await _context.DemandeTransport.FindAsync(id);
            if (demande == null) return NotFound(new { success = false, message = "Non trouvé" });

            if (!string.IsNullOrWhiteSpace(request.Statut)) demande.Statut = request.Statut;
            if (request.ChauffeurId.HasValue) demande.ChauffeurId = request.ChauffeurId.Value;

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        public class UpdateDemandeRequest
        {
            public string Statut { get; set; }
            public int? ChauffeurId { get; set; }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<object>> Delete(int id)
        {
            var demande = await _context.DemandeTransport.FindAsync(id);
            if (demande == null) return NotFound();

            _context.DemandeTransport.Remove(demande);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<object>> GetByClientId(int clientId)
        {
            var demandes = await _context.DemandeTransport
                .Include(d => d.Client)
                    .ThenInclude(c => c.ApplicationUser)
                .Include(d => d.Chauffeur)
                    .ThenInclude(ch => ch.ApplicationUser)
                .Include(d => d.Trajet)
                .Where(d => d.ClientId == clientId)
                .Select(d => new
                {
                    idDemande = d.IdDemande,
                    depart = d.Depart,
                    arrivee = d.Arrivee,
                    typeMarchandise = d.TypeMarchandise,
                    descriptionMarchandise = d.DescriptionMarchandise,
                    poids = d.Poids,
                    volume = d.Volume,
                    dateDepart = d.DateDepart,
                    heureDepart = d.HeureDepart,
                    instructions = d.Instructions,
                    statut = d.Statut,
                    prixEstime = d.PrixEstime,
                    clientId = d.ClientId,
                    chauffeurId = d.ChauffeurId,
                    client = d.Client != null ? new
                    {
                        idClient = d.Client.IdClient,
                        nom = d.Client.ApplicationUser != null ? d.Client.ApplicationUser.Nom : null,
                        prenom = d.Client.ApplicationUser != null ? d.Client.ApplicationUser.Prenom : null
                    } : null,
                    chauffeur = d.Chauffeur != null ? new
                    {
                        idChauffeur = d.Chauffeur.IdChauffeur,
                        statut = d.Chauffeur.Statut,
                        latitude = d.Chauffeur.Latitude,
                        longitude = d.Chauffeur.Longitude,
                        nom = d.Chauffeur.ApplicationUser != null ? d.Chauffeur.ApplicationUser.Nom : null,
                        prenom = d.Chauffeur.ApplicationUser != null ? d.Chauffeur.ApplicationUser.Prenom : null
                    } : null,
                    trajet = d.Trajet != null ? new
                    {
                        idTrajet = d.Trajet.IdTrajet,
                        adresseDepart = d.Trajet.AdresseDepart,
                        adresseArrivee = d.Trajet.AdresseArrivee,
                        distance = d.Trajet.Distance,
                        dureeEstimee = d.Trajet.DureeEstimee
                    } : null
                })
                .ToListAsync();

            return Ok(new { success = true, count = demandes.Count, demandes });
        }
    }
}