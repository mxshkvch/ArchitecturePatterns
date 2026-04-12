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
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS "PushTokenRegistrations" (
                    "Id" uuid NOT NULL,
                    "UserId" uuid NOT NULL,
                    "ApplicationType" integer NOT NULL,
                    "Token" character varying(4096) NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone NOT NULL,
                    CONSTRAINT "PK_PushTokenRegistrations" PRIMARY KEY ("Id")
                );
                """);

            migrationBuilder.Sql("""
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_PushTokenRegistrations_Token"
                ON "PushTokenRegistrations" ("Token");
                """);

            migrationBuilder.Sql("""
                CREATE INDEX IF NOT EXISTS "IX_PushTokenRegistrations_UserId_ApplicationType"
                ON "PushTokenRegistrations" ("UserId", "ApplicationType");
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP TABLE IF EXISTS "PushTokenRegistrations";
                """);
        }
    }
}
