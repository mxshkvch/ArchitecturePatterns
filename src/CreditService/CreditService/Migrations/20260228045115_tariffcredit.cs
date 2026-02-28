using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CreditService.Migrations
{
    /// <inheritdoc />
    public partial class tariffcredit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Credits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    userId = table.Column<Guid>(type: "uuid", nullable: false),
                    accountId = table.Column<Guid>(type: "uuid", nullable: false),
                    tarrifId = table.Column<Guid>(type: "uuid", nullable: false),
                    principal = table.Column<double>(type: "double precision", nullable: false),
                    remainingAmount = table.Column<double>(type: "double precision", nullable: false),
                    interestRate = table.Column<float>(type: "real", nullable: false),
                    startDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    endDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Credits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tariffs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    interestRate = table.Column<float>(type: "real", nullable: false),
                    minAmount = table.Column<double>(type: "double precision", nullable: false),
                    maxAmount = table.Column<double>(type: "double precision", nullable: false),
                    minTerm = table.Column<int>(type: "integer", nullable: false),
                    maxTerm = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tariffs", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Credits");

            migrationBuilder.DropTable(
                name: "Tariffs");
        }
    }
}
