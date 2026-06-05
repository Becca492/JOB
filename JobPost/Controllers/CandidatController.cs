using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPost.Data;
using JobPost.Models;

namespace JobPost.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CandidatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CandidatController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================
        // TOUS LES CANDIDATS
        // ==========================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAll()
        {
            var candidats = await _context.Users
                .Where(u => u.Role == "candidat")
                .ToListAsync();

            return Ok(candidats);
        }

        // ==========================
        // UN CANDIDAT PAR EMAIL
        // ==========================
        [HttpGet("{email}")]
        public async Task<ActionResult<User>> GetByEmail(string email)
        {
            var candidat = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (candidat == null)
                return NotFound("Candidat introuvable.");

            return Ok(candidat);
        }

        // ==========================
        // AJOUTER UN CANDIDAT
        // ==========================
        [HttpPost]
        public async Task<ActionResult<User>> Create(User candidat)
        {
            candidat.Role = "candidat";
            candidat.DateCreation = DateTime.UtcNow;

            _context.Users.Add(candidat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetByEmail),
                new { email = candidat.Email },
                candidat
            );
        }

        // ==========================
        // MODIFIER UN CANDIDAT
        // ==========================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, User updatedUser)
        {
            var candidat = await _context.Users.FindAsync(id);

            if (candidat == null)
                return NotFound("Candidat introuvable.");

            candidat.Prenom = updatedUser.Prenom;
            candidat.Nom = updatedUser.Nom;
            candidat.Email = updatedUser.Email;
            candidat.Telephone = updatedUser.Telephone;
            candidat.Ville = updatedUser.Ville;
            candidat.Pays = updatedUser.Pays;

            candidat.Poste = updatedUser.Poste;
            candidat.Secteur = updatedUser.Secteur;
            candidat.Disponibilite = updatedUser.Disponibilite;

            candidat.NiveauEtude = updatedUser.NiveauEtude;
            candidat.PretentionSalariale = updatedUser.PretentionSalariale;

            candidat.Experience = updatedUser.Experience;
            candidat.Skills = updatedUser.Skills;
            candidat.Bio = updatedUser.Bio;
            candidat.CvFilePath = updatedUser.CvFilePath;

            await _context.SaveChangesAsync();

            return Ok(candidat);
        }

        // ==========================
        // SUPPRIMER UN CANDIDAT
        // ==========================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var candidat = await _context.Users.FindAsync(id);

            if (candidat == null)
                return NotFound("Candidat introuvable.");

            _context.Users.Remove(candidat);
            await _context.SaveChangesAsync();

            return Ok("Candidat supprimé.");
        }
    }
}