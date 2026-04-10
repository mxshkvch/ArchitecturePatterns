using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MonitoringService.Domain.Entities;

namespace MonitoringService.Data.Configurations;

public sealed class RequestLogConfiguration : IEntityTypeConfiguration<RequestLog>
{
    public void Configure(EntityTypeBuilder<RequestLog> builder)
    {
        builder.ToTable("request_logs", "monitoring");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.ServiceName).IsRequired();
        builder.Property(x => x.StatusCode).IsRequired();
        builder.Property(x => x.DurationMs).IsRequired();
        builder.Property(x => x.ErrorPercentage).IsRequired();
        builder.Property(x => x.IsError).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasIndex(x => x.CreatedAtUtc).HasDatabaseName("idx_request_logs_created_at");
        builder.HasIndex(x => x.ServiceName).HasDatabaseName("idx_request_logs_service_name");
    }
}
