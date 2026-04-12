using BffService.Abstractions;
using BffService.Configurations;
using BffService.Exceptions;
using BffService.Enums;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;

namespace BffService.Services;

public sealed class FirebaseTopicSubscriptionService : IFirebaseTopicSubscriptionService
{
    private const string AppName = "bff-service-firebase-push";
    private readonly FirebasePushOptions options;
    private readonly ILogger<FirebaseTopicSubscriptionService> logger;
    private readonly object initializationLock = new();
    private FirebaseMessaging? firebaseMessaging;
    private FirebasePushOptions effectiveOptions;
    private bool enabled;

    public FirebaseTopicSubscriptionService(
        IOptions<FirebasePushOptions> options,
        ILogger<FirebaseTopicSubscriptionService> logger)
    {
        this.options = options.Value;
        this.logger = logger;
        effectiveOptions = BuildEffectiveOptions();
        InitializeFirebase(false);
    }

    public string ResolveTopic(ApplicationType applicationType, Guid userId)
    {
        return applicationType == ApplicationType.EMPLOYEE
            ? effectiveOptions.StaffTopic
            : $"{effectiveOptions.ClientTopicPrefix}{userId}";
    }

    public async Task SubscribeAsync(string token, ApplicationType applicationType, Guid userId, CancellationToken cancellationToken)
    {
        if (!enabled || firebaseMessaging is null)
        {
            InitializeFirebase(true);
        }

        if (!enabled || firebaseMessaging is null)
        {
            logger.LogError(
                "Subscribe skipped because Firebase topic subscription is unavailable. Enabled={Enabled}; MessagingReady={MessagingReady}; ApplicationType={ApplicationType}; UserId={UserId}; TokenSuffix={TokenSuffix}",
                enabled,
                firebaseMessaging is not null,
                applicationType,
                userId,
                GetTokenSuffix(token));
            throw new FirebaseSubscriptionUnavailableException("Firebase topic subscription is not initialized.");
        }

        var topic = ResolveTopic(applicationType, userId);
        cancellationToken.ThrowIfCancellationRequested();
        logger.LogInformation(
            "Subscribing token to Firebase topic. Topic={Topic}; ApplicationType={ApplicationType}; UserId={UserId}; TokenSuffix={TokenSuffix}",
            topic,
            applicationType,
            userId,
            GetTokenSuffix(token));
        var response = await firebaseMessaging.SubscribeToTopicAsync(new[] { token }, topic);
        logger.LogInformation(
            "Firebase subscribe completed. Topic={Topic}; SuccessCount={SuccessCount}; FailureCount={FailureCount}; ErrorCount={ErrorCount}; TokenSuffix={TokenSuffix}",
            topic,
            response.SuccessCount,
            response.FailureCount,
            response.Errors.Count,
            GetTokenSuffix(token));
        if (response.FailureCount > 0)
        {
            var firstError = response.Errors.FirstOrDefault();
            throw new InvalidOperationException(
                $"Firebase subscribe failed for topic '{topic}'. FailureCount={response.FailureCount}; FirstErrorReason={firstError?.Reason}; FirstErrorIndex={firstError?.Index}");
        }
    }

    public async Task UnsubscribeAsync(string token, ApplicationType applicationType, Guid userId, CancellationToken cancellationToken)
    {
        if (!enabled || firebaseMessaging is null)
        {
            logger.LogWarning(
                "Unsubscribe skipped because Firebase topic subscription is unavailable. Enabled={Enabled}; MessagingReady={MessagingReady}; ApplicationType={ApplicationType}; UserId={UserId}; TokenSuffix={TokenSuffix}",
                enabled,
                firebaseMessaging is not null,
                applicationType,
                userId,
                GetTokenSuffix(token));
            return;
        }

        var topic = ResolveTopic(applicationType, userId);
        cancellationToken.ThrowIfCancellationRequested();
        logger.LogInformation(
            "Unsubscribing token from Firebase topic. Topic={Topic}; ApplicationType={ApplicationType}; UserId={UserId}; TokenSuffix={TokenSuffix}",
            topic,
            applicationType,
            userId,
            GetTokenSuffix(token));
        var response = await firebaseMessaging.UnsubscribeFromTopicAsync(new[] { token }, topic);
        logger.LogInformation(
            "Firebase unsubscribe completed. Topic={Topic}; SuccessCount={SuccessCount}; FailureCount={FailureCount}; ErrorCount={ErrorCount}; TokenSuffix={TokenSuffix}",
            topic,
            response.SuccessCount,
            response.FailureCount,
            response.Errors.Count,
            GetTokenSuffix(token));
    }

    private void InitializeFirebase(bool force)
    {
        lock (initializationLock)
        {
            if (!force && enabled && firebaseMessaging is not null)
            {
                return;
            }

            effectiveOptions = BuildEffectiveOptions();
            var credentialsFileExists = !string.IsNullOrWhiteSpace(effectiveOptions.CredentialsFilePath)
                && File.Exists(effectiveOptions.CredentialsFilePath);
            logger.LogInformation(
                "Firebase topic subscription init. Enabled={Enabled}; ProjectId={ProjectId}; CredentialsFilePath={CredentialsFilePath}; CredentialsFileExists={CredentialsFileExists}; HasCredentialsJson={HasCredentialsJson}; ClientTopicPrefix={ClientTopicPrefix}; StaffTopic={StaffTopic}",
                effectiveOptions.Enabled,
                effectiveOptions.ProjectId ?? string.Empty,
                effectiveOptions.CredentialsFilePath ?? string.Empty,
                credentialsFileExists,
                !string.IsNullOrWhiteSpace(effectiveOptions.CredentialsJson),
                effectiveOptions.ClientTopicPrefix,
                effectiveOptions.StaffTopic);

            var hasCredentials = !string.IsNullOrWhiteSpace(effectiveOptions.CredentialsJson) || credentialsFileExists;
            if (!effectiveOptions.Enabled && !hasCredentials)
            {
                enabled = false;
                firebaseMessaging = null;
                logger.LogWarning("Firebase topic subscription is disabled by configuration.");
                return;
            }

            if (!effectiveOptions.Enabled && hasCredentials)
            {
                logger.LogWarning("Firebase topic subscription enabled flag is false but credentials are available. Attempting initialization.");
            }

            try
            {
                if (!TryResolveCredential(effectiveOptions, out var credential))
                {
                    enabled = false;
                    firebaseMessaging = null;
                    logger.LogWarning("Firebase push is enabled but credentials are missing. Topic subscription is disabled.");
                    return;
                }

                var appOptions = new AppOptions
                {
                    Credential = credential
                };

                if (!string.IsNullOrWhiteSpace(effectiveOptions.ProjectId))
                {
                    appOptions.ProjectId = effectiveOptions.ProjectId;
                }

                FirebaseApp? firebaseApp = null;
                try
                {
                    firebaseApp = FirebaseApp.GetInstance(AppName);
                }
                catch (ArgumentException)
                {
                }

                if (firebaseApp is null)
                {
                    firebaseApp = FirebaseApp.Create(appOptions, AppName);
                }

                if (firebaseApp is null)
                {
                    throw new InvalidOperationException("Firebase app instance could not be created.");
                }

                firebaseMessaging = FirebaseMessaging.GetMessaging(firebaseApp);
                enabled = true;
                logger.LogInformation("Firebase topic subscription initialized successfully.");
            }
            catch (Exception exception)
            {
                enabled = false;
                firebaseMessaging = null;
                logger.LogError(exception, "Failed to initialize Firebase topic subscription service.");
            }
        }
    }

    private FirebasePushOptions BuildEffectiveOptions()
    {
        var effective = new FirebasePushOptions
        {
            Enabled = options.Enabled,
            ProjectId = options.ProjectId,
            CredentialsFilePath = options.CredentialsFilePath,
            CredentialsJson = options.CredentialsJson,
            ClientTopicPrefix = options.ClientTopicPrefix,
            StaffTopic = options.StaffTopic
        };

        var enabledEnv = Environment.GetEnvironmentVariable("FirebasePush__Enabled");
        if (!string.IsNullOrWhiteSpace(enabledEnv) && bool.TryParse(enabledEnv, out var enabledValue))
        {
            effective.Enabled = enabledValue;
        }

        var projectIdEnv = Environment.GetEnvironmentVariable("FirebasePush__ProjectId");
        if (!string.IsNullOrWhiteSpace(projectIdEnv))
        {
            effective.ProjectId = projectIdEnv;
        }

        var credentialsPathEnv = Environment.GetEnvironmentVariable("FirebasePush__CredentialsFilePath");
        if (!string.IsNullOrWhiteSpace(credentialsPathEnv))
        {
            effective.CredentialsFilePath = credentialsPathEnv;
        }

        var credentialsJsonEnv = Environment.GetEnvironmentVariable("FirebasePush__CredentialsJson");
        if (!string.IsNullOrWhiteSpace(credentialsJsonEnv))
        {
            effective.CredentialsJson = credentialsJsonEnv;
        }

        var clientTopicPrefixEnv = Environment.GetEnvironmentVariable("FirebasePush__ClientTopicPrefix");
        if (!string.IsNullOrWhiteSpace(clientTopicPrefixEnv))
        {
            effective.ClientTopicPrefix = clientTopicPrefixEnv;
        }

        var staffTopicEnv = Environment.GetEnvironmentVariable("FirebasePush__StaffTopic");
        if (!string.IsNullOrWhiteSpace(staffTopicEnv))
        {
            effective.StaffTopic = staffTopicEnv;
        }

        return effective;
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

    private static string GetTokenSuffix(string token)
    {
        return token.Length <= 12 ? token : token[^12..];
    }
}
