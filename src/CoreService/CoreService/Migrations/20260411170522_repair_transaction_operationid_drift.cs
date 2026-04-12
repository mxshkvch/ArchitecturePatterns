using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoreService.Migrations
{
    /// <inheritdoc />
    public partial class repair_transaction_operationid_drift : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'Transactions'
                          AND column_name = 'OperationId'
                    ) THEN
                        ALTER TABLE "Transactions" ADD COLUMN "OperationId" uuid NULL;
                    END IF;
                END $$;
                """);

            migrationBuilder.Sql(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_Transactions_OperationId_AccountId"
                ON "Transactions" ("OperationId", "AccountId")
                WHERE "OperationId" IS NOT NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP INDEX IF EXISTS "IX_Transactions_OperationId_AccountId";
                """);

            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'Transactions'
                          AND column_name = 'OperationId'
                    ) THEN
                        ALTER TABLE "Transactions" DROP COLUMN "OperationId";
                    END IF;
                END $$;
                """);
        }
    }
}
