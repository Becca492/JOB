using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPost.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateCreation",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Disponibilite",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NiveauEtude",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PretentionSalariale",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateCreation",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Disponibilite",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "NiveauEtude",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PretentionSalariale",
                table: "Users");
        }
    }
}
