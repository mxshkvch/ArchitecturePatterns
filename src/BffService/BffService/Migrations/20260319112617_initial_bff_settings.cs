using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BffService.Migrations
{
    /// <inheritdoc />
    public partial class initial_bff_settings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS "UserSettings" (
                    "Id" uuid NOT NULL,
                    "UserId" uuid NOT NULL,
                    "ApplicationType" integer NOT NULL,
                    "Theme" integer NOT NULL,
                    "HiddenAccountIdsJson" text NOT NULL,
                    "UpdatedAt" timestamp with time zone NOT NULL,
                    CONSTRAINT "PK_UserSettings" PRIMARY KEY ("Id")
                );
                """);

            migrationBuilder.Sql("""
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_UserSettings_UserId_ApplicationType"
                ON "UserSettings" ("UserId", "ApplicationType");
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP TABLE IF EXISTS "UserSettings";
                """);
        }
    }
}
