using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPost.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Prenom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telephone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Ville = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pays = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Poste = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Secteur = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Experience = table.Column<int>(type: "int", nullable: false),
                    Skills = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CvFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
