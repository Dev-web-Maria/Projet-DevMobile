using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using AlloHanda.Models;
using AlloHonda.Data;

namespace AlloHonda.Controllers
{
    public class DemandeTransportsController : Controller
    {
        private readonly AlloHondaContext _context;

        public DemandeTransportsController(AlloHondaContext context)
        {
            _context = context;
        }

        // GET: DemandeTransports
        public async Task<IActionResult> Index()
        {
            var alloHondaContext = _context.DemandeTransport.Include(d => d.Chauffeur).Include(d => d.Client);
            return View(await alloHondaContext.ToListAsync());
        }

        // GET: DemandeTransports/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var demandeTransport = await _context.DemandeTransport
                .Include(d => d.Chauffeur)
                .Include(d => d.Client)
                .FirstOrDefaultAsync(m => m.IdDemande == id);
            if (demandeTransport == null)
            {
                return NotFound();
            }

            return View(demandeTransport);
        }

        // GET: DemandeTransports/Create
        public IActionResult Create()
        {
            ViewData["ChauffeurId"] = new SelectList(_context.Chauffeur, "IdChauffeur", "ApplicationUserId");
            ViewData["ClientId"] = new SelectList(_context.Client, "IdClient", "ApplicationUserId");
            return View();
        }

        // POST: DemandeTransports/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("IdDemande,DescriptionMarchandise,Poids,Statut,PrixEstime,ClientId,ChauffeurId")] DemandeTransport demandeTransport)
        {
            if (ModelState.IsValid)
            {
                _context.Add(demandeTransport);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["ChauffeurId"] = new SelectList(_context.Chauffeur, "IdChauffeur", "ApplicationUserId", demandeTransport.ChauffeurId);
            ViewData["ClientId"] = new SelectList(_context.Client, "IdClient", "ApplicationUserId", demandeTransport.ClientId);
            return View(demandeTransport);
        }

        // GET: DemandeTransports/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var demandeTransport = await _context.DemandeTransport.FindAsync(id);
            if (demandeTransport == null)
            {
                return NotFound();
            }
            ViewData["ChauffeurId"] = new SelectList(_context.Chauffeur, "IdChauffeur", "ApplicationUserId", demandeTransport.ChauffeurId);
            ViewData["ClientId"] = new SelectList(_context.Client, "IdClient", "ApplicationUserId", demandeTransport.ClientId);
            return View(demandeTransport);
        }

        // POST: DemandeTransports/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("IdDemande,DescriptionMarchandise,Poids,Statut,PrixEstime,ClientId,ChauffeurId")] DemandeTransport demandeTransport)
        {
            if (id != demandeTransport.IdDemande)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(demandeTransport);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!DemandeTransportExists(demandeTransport.IdDemande))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            ViewData["ChauffeurId"] = new SelectList(_context.Chauffeur, "IdChauffeur", "ApplicationUserId", demandeTransport.ChauffeurId);
            ViewData["ClientId"] = new SelectList(_context.Client, "IdClient", "ApplicationUserId", demandeTransport.ClientId);
            return View(demandeTransport);
        }

        // GET: DemandeTransports/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var demandeTransport = await _context.DemandeTransport
                .Include(d => d.Chauffeur)
                .Include(d => d.Client)
                .FirstOrDefaultAsync(m => m.IdDemande == id);
            if (demandeTransport == null)
            {
                return NotFound();
            }

            return View(demandeTransport);
        }

        // POST: DemandeTransports/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var demandeTransport = await _context.DemandeTransport.FindAsync(id);
            if (demandeTransport != null)
            {
                _context.DemandeTransport.Remove(demandeTransport);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool DemandeTransportExists(int id)
        {
            return _context.DemandeTransport.Any(e => e.IdDemande == id);
        }
    }
}
