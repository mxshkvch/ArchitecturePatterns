using System.Globalization;
using CoreService.Abstractions.Realtime;
using CoreService.Configurations;
using CoreService.Messaging;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;

namespace CoreService.Services.Realtime;

public sealed class FirebasePushNotificationService : IFirebasePushNotificationService
{
    private const string AppName = "core-service-firebase-push";
    private readonly FirebaseMessaging? firebaseMessaging;
    private readonly FirebasePushOptions options;
    private readonly ILogger<FirebasePushNotificationService> logger;
    private readonly bool enabled;

    public FirebasePushNotificationService(
        IOptions<FirebasePushOptions> options,
        ILogger<FirebasePushNotificationService> logger)
    {
        this.options = options.Value;
        this.logger = logger;
        logger.LogInformation(
            "Firebase push init. Enabled={Enabled}; ProjectId={ProjectId}; CredentialsFilePath={CredentialsFilePath}; HasCredentialsJson={HasCredentialsJson}; ClientTopicPrefix={ClientTopicPrefix}; StaffTopic={StaffTopic}",
            this.options.Enabled,
            this.options.ProjectId ?? string.Empty,
            this.options.CredentialsFilePath ?? string.Empty,
            !string.IsNullOrWhiteSpace(this.options.CredentialsJson),
            this.options.ClientTopicPrefix,
            this.options.StaffTopic);

        if (!this.options.Enabled)
        {
            logger.LogWarning("Firebase push is disabled by configuration.");
            return;
        }

        try
        {
            if (!TryResolveCredential(this.options, out var credential))
            {
                logger.LogWarning("Firebase push is enabled but credentials are missing. Push delivery is disabled.");
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
            logger.LogInformation("Firebase push initialized successfully.");
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to initialize Firebase push notifications. Push delivery is disabled.");
        }
    }

    public async Task NotifyOperationUpdatedAsync(
        AccountOperationMessage message,
        DateTimeOffset occurredAt,
        CancellationToken cancellationToken)
    {
        if (!enabled || firebaseMessaging is null)
        {
            logger.LogWarning(
                "Firebase send skipped because service is unavailable. Enabled={Enabled}; MessagingReady={MessagingReady}; OperationId={OperationId}; OperationType={OperationType}; UserId={UserId}; TargetUserId={TargetUserId}",
                enabled,
                firebaseMessaging is not null,
                message.OperationId,
                message.OperationType,
                message.UserId,
                message.TargetUserId);
            return;
        }

        var topics = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            options.StaffTopic,
            $"{options.ClientTopicPrefix}{message.UserId}"
        };

        if (message.TargetUserId.HasValue && message.TargetUserId.Value != message.UserId)
        {
            topics.Add($"{options.ClientTopicPrefix}{message.TargetUserId.Value}");
        }

        var data = new Dictionary<string, string>
        {
            ["type"] = "operation_invalidation",
            ["operationId"] = message.OperationId.ToString(),
            ["idempotencyKey"] = message.IdempotencyKey ?? string.Empty,
            ["operationType"] = message.OperationType.ToString(),
            ["accountId"] = message.AccountId.ToString(),
            ["targetAccountId"] = message.TargetAccountId?.ToString() ?? string.Empty,
            ["userId"] = message.UserId.ToString(),
            ["targetUserId"] = message.TargetUserId?.ToString() ?? string.Empty,
            ["amount"] = message.Amount.ToString(CultureInfo.InvariantCulture),
            ["createdAt"] = message.CreatedAt.ToString("O"),
            ["occurredAt"] = occurredAt.ToString("O")
        };

        foreach (var topic in topics.Where(topic => !string.IsNullOrWhiteSpace(topic)))
        {
            try
            {
                logger.LogInformation(
                    "Sending Firebase notification. Topic={Topic}; OperationId={OperationId}; OperationType={OperationType}; UserId={UserId}; TargetUserId={TargetUserId}; Amount={Amount}; IdempotencyKey={IdempotencyKey}",
                    topic,
                    message.OperationId,
                    message.OperationType,
                    message.UserId,
                    message.TargetUserId,
                    message.Amount,
                    message.IdempotencyKey ?? string.Empty);
                var pushMessage = new Message
                {
                    Topic = topic,
                    Data = data,
                    Notification = new Notification
                    {
                        Title = "Operation updated",
                        Body = $"{message.OperationType}: {message.Amount.ToString(CultureInfo.InvariantCulture)}"
                    }
                };

                var messageId = await firebaseMessaging.SendAsync(pushMessage, cancellationToken);
                logger.LogInformation(
                    "Firebase notification sent successfully. Topic={Topic}; MessageId={MessageId}; OperationId={OperationId}",
                    topic,
                    messageId,
                    message.OperationId);
            }
            catch (Exception exception)
            {
                logger.LogError(
                    exception,
                    "Failed to deliver Firebase notification. Topic={Topic}; OperationId={OperationId}; OperationType={OperationType}; UserId={UserId}; TargetUserId={TargetUserId}; IdempotencyKey={IdempotencyKey}",
                    topic,
                    message.OperationId,
                    message.OperationType,
                    message.UserId,
                    message.TargetUserId,
                    message.IdempotencyKey ?? string.Empty);
            }
        }
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
