namespace CoreService.Configurations;

public sealed class FirebasePushOptions
{
    public bool Enabled { get; set; } = false;
    public string? ProjectId { get; set; }
    public string? CredentialsFilePath { get; set; }
    public string? CredentialsJson { get; set; }
    public string ClientTopicPrefix { get; set; } = "user-";
    public string StaffTopic { get; set; } = "employees";
}
