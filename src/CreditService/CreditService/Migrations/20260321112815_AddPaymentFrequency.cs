using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CreditService.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentFrequency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastPaymentDate",
                table: "Credits",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentFrequencyMinutes",
                table: "Credits",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastPaymentDate",
                table: "Credits");

            migrationBuilder.DropColumn(
                name: "PaymentFrequencyMinutes",
                table: "Credits");
        }
    }
}
