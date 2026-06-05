using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using JobPost.Data;
using JobPost.Models;

namespace JobPost.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🔐 protège tout le controller
    public class RecruteurController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RecruteurController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================
        // TOUS LES CANDIDATS
        // ==========================
        [Authorize(Roles = "admin,recruteur")] // 👈 ICI
        [HttpGet("candidats")]
        public async Task<IActionResult> GetCandidats()
        {
            var candidats = await _context.Users
                .Where(x => x.Role == "candidat")
                .ToListAsync();

            return Ok(candidats);
        }

        // ==========================
        // UN CANDIDAT PAR ID
        // ==========================
        [Authorize(Roles = "admin,recruteur")]
        [HttpGet("candidat/{id}")]
        public async Task<IActionResult> GetCandidat(int id)
        {
            var candidat = await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.Role == "candidat");

            if (candidat == null)
                return NotFound("Candidat introuvable.");

            return Ok(candidat);
        }

        // ==========================
        // RECHERCHE
        // ==========================
        [Authorize(Roles = "admin,recruteur")]
        [HttpGet("search")]
        public async Task<IActionResult> Search(string motCle)
        {
            var candidats = await _context.Users
                .Where(x =>
                    x.Role == "candidat" &&
                    (
                        x.Prenom.Contains(motCle) ||
                        x.Nom.Contains(motCle) ||
                        x.Poste!.Contains(motCle) ||
                        x.Secteur!.Contains(motCle)
                    ))
                .ToListAsync();

            return Ok(candidats);
        }

        // ==========================
        // DISPONIBLES
        // ==========================
        [Authorize(Roles = "admin,recruteur")]
        [HttpGet("disponibles")]
        public async Task<IActionResult> GetDisponibles()
        {
            var candidats = await _context.Users
                .Where(x =>
                    x.Role == "candidat" &&
                    x.Disponibilite == "Immédiate")
                .ToListAsync();

            return Ok(candidats);
        }
    }
}