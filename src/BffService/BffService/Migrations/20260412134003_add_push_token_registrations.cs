using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BffService.Migrations
{
    /// <inheritdoc />
    public partial class add_push_token_registrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PushTokenRegistrations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationType = table.Column<int>(type: "integer", nullable: false),
                    Token = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PushTokenRegistrations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PushTokenRegistrations_Token",
                table: "PushTokenRegistrations",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PushTokenRegistrations_UserId_ApplicationType",
                table: "PushTokenRegistrations",
                columns: new[] { "UserId", "ApplicationType" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PushTokenRegistrations");
        }
    }
}
