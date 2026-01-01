using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlloHonda.Data;
using AlloHonda.Models;

namespace AlloHonda.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrajetsController : ControllerBase
    {
        private readonly AlloHondaContext _context;

        public TrajetsController(AlloHondaContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Trajet>>> GetTrajets()
        {
            return await _context.Trajet.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Trajet>> CreateTrajet(Trajet trajet)
        {
            _context.Trajet.Add(trajet);
            await _context.SaveChangesAsync();

            return Ok(trajet);
        }
    }
}
