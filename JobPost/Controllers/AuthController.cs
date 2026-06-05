using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using JobPost.Data;
using JobPost.Models;
using JobPost.Services;

namespace JobPost.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwt;

        public AuthController(ApplicationDbContext context, JwtService jwt)
        {
            _context = context;
            _jwt = jwt;
        }

        // ==========================
        // INSCRIPTION
        // ==========================
        [HttpPost("register")]
        public async Task<IActionResult> Register(User model)
        {
            if (await _context.Users.AnyAsync(x => x.Email == model.Email))
            {
                return BadRequest("Cet email existe déjà.");
            }

            model.Role = "candidat";
            model.DateCreation = DateTime.UtcNow;

            _context.Users.Add(model);
            await _context.SaveChangesAsync();

            return Ok(model);
        }

        // ==========================
        // CONNEXION (JWT)
        // ==========================
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x =>
                x.Email == request.Email &&
                x.PasswordHash == request.Password);

            if (user == null)
            {
                return Unauthorized("Email ou mot de passe incorrect.");
            }

            var token = _jwt.GenerateToken(user);

            return Ok(new
            {
                user.Id,
                user.Prenom,
                user.Nom,
                user.Email,
                user.Role,
                token
            });
        }

        // ==========================
        // EMAIL EXISTANT ?
        // ==========================
        [HttpGet("email-exists/{email}")]
        public async Task<IActionResult> EmailExists(string email)
        {
            bool exists = await _context.Users.AnyAsync(x => x.Email == email);

            return Ok(exists);
        }
    }
}