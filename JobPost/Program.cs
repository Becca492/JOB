using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using JobPost.Data;
using JobPost.Services; // si JwtService est ici

var builder = WebApplication.CreateBuilder(args);

// ================== SERVICES ==================
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DB
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        p => p.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("CLE_SECRETE_SUPER_LONGUE_12345"))
    };
});

// 🔥 ICI (AVANT BUILD)
builder.Services.AddScoped<JwtService>();

// ================== BUILD ==================
var app = builder.Build();

// ================== MIDDLEWARE ==================
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();