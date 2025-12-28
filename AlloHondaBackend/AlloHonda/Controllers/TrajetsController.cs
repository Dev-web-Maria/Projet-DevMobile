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
    public class TrajetsController : Controller
    {
        private readonly AlloHondaContext _context;

        public TrajetsController(AlloHondaContext context)
        {
            _context = context;
        }

        // GET: Trajets
        public async Task<IActionResult> Index()
        {
            var alloHondaContext = _context.Trajet.Include(t => t.DemandeTransport);
            return View(await alloHondaContext.ToListAsync());
        }

        // GET: Trajets/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var trajet = await _context.Trajet
                .Include(t => t.DemandeTransport)
                .FirstOrDefaultAsync(m => m.IdTrajet == id);
            if (trajet == null)
            {
                return NotFound();
            }

            return View(trajet);
        }

        // GET: Trajets/Create
        public IActionResult Create()
        {
            ViewData["DemandeTransportId"] = new SelectList(_context.DemandeTransport, "IdDemande", "IdDemande");
            return View();
        }

        // POST: Trajets/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("IdTrajet,AdresseDepart,AdresseArrivee,Distance,DureeEstimee,DemandeTransportId")] Trajet trajet)
        {
            if (ModelState.IsValid)
            {
                _context.Add(trajet);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["DemandeTransportId"] = new SelectList(_context.DemandeTransport, "IdDemande", "IdDemande", trajet.DemandeTransportId);
            return View(trajet);
        }

        // GET: Trajets/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var trajet = await _context.Trajet.FindAsync(id);
            if (trajet == null)
            {
                return NotFound();
            }
            ViewData["DemandeTransportId"] = new SelectList(_context.DemandeTransport, "IdDemande", "IdDemande", trajet.DemandeTransportId);
            return View(trajet);
        }

        // POST: Trajets/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("IdTrajet,AdresseDepart,AdresseArrivee,Distance,DureeEstimee,DemandeTransportId")] Trajet trajet)
        {
            if (id != trajet.IdTrajet)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(trajet);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!TrajetExists(trajet.IdTrajet))
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
            ViewData["DemandeTransportId"] = new SelectList(_context.DemandeTransport, "IdDemande", "IdDemande", trajet.DemandeTransportId);
            return View(trajet);
        }

        // GET: Trajets/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var trajet = await _context.Trajet
                .Include(t => t.DemandeTransport)
                .FirstOrDefaultAsync(m => m.IdTrajet == id);
            if (trajet == null)
            {
                return NotFound();
            }

            return View(trajet);
        }

        // POST: Trajets/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var trajet = await _context.Trajet.FindAsync(id);
            if (trajet != null)
            {
                _context.Trajet.Remove(trajet);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool TrajetExists(int id)
        {
            return _context.Trajet.Any(e => e.IdTrajet == id);
        }
    }
}
