namespace BffService.Configurations;

public sealed class FirebasePushOptions
{
    public bool Enabled { get; set; } = true;
    public string? ProjectId { get; set; } = "architecturepatterns-d92c3";
    public string? CredentialsFilePath { get; set; } = "/app/secrets/firebase-service-account.json";
    public string? CredentialsJson { get; set; }
    public string ClientTopicPrefix { get; set; } = "user-";
    public string StaffTopic { get; set; } = "employees";
}
