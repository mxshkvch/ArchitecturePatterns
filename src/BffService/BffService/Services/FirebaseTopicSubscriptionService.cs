using BffService.Abstractions;
using BffService.Configurations;
using BffService.Enums;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;

namespace BffService.Services;

public sealed class FirebaseTopicSubscriptionService : IFirebaseTopicSubscriptionService
{
    private const string AppName = "bff-service-firebase-push";
    private readonly FirebaseMessaging? firebaseMessaging;
    private readonly FirebasePushOptions options;
    private readonly ILogger<FirebaseTopicSubscriptionService> logger;
    private readonly bool enabled;

    public FirebaseTopicSubscriptionService(
        IOptions<FirebasePushOptions> options,
        ILogger<FirebaseTopicSubscriptionService> logger)
    {
        this.options = options.Value;
        this.logger = logger;

        if (!this.options.Enabled)
        {
            return;
        }

        try
        {
            if (!TryResolveCredential(this.options, out var credential))
            {
                logger.LogWarning("Firebase push is enabled but credentials are missing. Topic subscription is disabled.");
                return;
            }

            var appOptions = new AppOptions
            {
                Credential = credential
            };

            if (!string.IsNullOrWhiteSpace(this.options.ProjectId))
            {
                appOptions.ProjectId = this.options.ProjectId;
            }

            FirebaseApp firebaseApp;
            try
            {
                firebaseApp = FirebaseApp.GetInstance(AppName);
            }
            catch (ArgumentException)
            {
                firebaseApp = FirebaseApp.Create(appOptions, AppName);
            }

            firebaseMessaging = FirebaseMessaging.GetMessaging(firebaseApp);
            enabled = true;
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to initialize Firebase topic subscription service.");
        }
    }

    public string ResolveTopic(ApplicationType applicationType, Guid userId)
    {
        return applicationType == ApplicationType.EMPLOYEE
            ? options.StaffTopic
            : $"{options.ClientTopicPrefix}{userId}";
    }

    public async Task SubscribeAsync(string token, ApplicationType applicationType, Guid userId, CancellationToken cancellationToken)
    {
        if (!enabled || firebaseMessaging is null)
        {
            return;
        }

        var topic = ResolveTopic(applicationType, userId);
        cancellationToken.ThrowIfCancellationRequested();
        await firebaseMessaging.SubscribeToTopicAsync(new[] { token }, topic);
    }

    public async Task UnsubscribeAsync(string token, ApplicationType applicationType, Guid userId, CancellationToken cancellationToken)
    {
        if (!enabled || firebaseMessaging is null)
        {
            return;
        }

        var topic = ResolveTopic(applicationType, userId);
        cancellationToken.ThrowIfCancellationRequested();
        await firebaseMessaging.UnsubscribeFromTopicAsync(new[] { token }, topic);
    }

    private static bool TryResolveCredential(FirebasePushOptions options, out GoogleCredential? credential)
    {
        credential = null;

        if (!string.IsNullOrWhiteSpace(options.CredentialsJson))
        {
            credential = GoogleCredential.FromJson(options.CredentialsJson);
            return true;
        }

        if (!string.IsNullOrWhiteSpace(options.CredentialsFilePath) && File.Exists(options.CredentialsFilePath))
        {
            credential = GoogleCredential.FromFile(options.CredentialsFilePath);
            return true;
        }

        return false;
    }
}
