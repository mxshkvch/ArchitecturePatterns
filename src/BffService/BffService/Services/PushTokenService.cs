using BffService.Abstractions;
using BffService.Data;
using BffService.DTOs.Requests;
using BffService.DTOs.Responses;
using BffService.Entities;
using BffService.Enums;
using BffService.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace BffService.Services;

public sealed class PushTokenService(
    BffDbContext dbContext,
    IFirebaseTopicSubscriptionService firebaseTopicSubscriptionService,
    ILogger<PushTokenService> logger) : IPushTokenService
{
    private const int MaxTokenLength = 4096;

    public async Task<PushTokenRegistrationResponse> RegisterAsync(Guid userId, RegisterPushTokenRequest request, CancellationToken cancellationToken)
    {
        var token = NormalizeToken(request.Token);
        var now = DateTimeOffset.UtcNow;
        logger.LogInformation(
            "Registering push token. UserId={UserId}; ApplicationType={ApplicationType}; TokenSuffix={TokenSuffix}",
            userId,
            request.ApplicationType,
            GetTokenSuffix(token));

        var existing = await dbContext.PushTokenRegistrations
            .SingleOrDefaultAsync(x => x.Token == token, cancellationToken);

        if (existing == null)
        {
            existing = new PushTokenRegistration
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ApplicationType = request.ApplicationType,
                Token = token,
                CreatedAt = now,
                UpdatedAt = now
            };

            dbContext.PushTokenRegistrations.Add(existing);
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogInformation(
                "Created new push token registration. UserId={UserId}; ApplicationType={ApplicationType}; TokenSuffix={TokenSuffix}",
                existing.UserId,
                existing.ApplicationType,
                GetTokenSuffix(existing.Token));
        }
        else
        {
            var shouldUnsubscribeOldTopic = existing.UserId != userId || existing.ApplicationType != request.ApplicationType;
            var oldUserId = existing.UserId;
            var oldApplicationType = existing.ApplicationType;
            logger.LogInformation(
                "Updating existing push token registration. PreviousUserId={PreviousUserId}; PreviousApplicationType={PreviousApplicationType}; NewUserId={NewUserId}; NewApplicationType={NewApplicationType}; TokenSuffix={TokenSuffix}",
                oldUserId,
                oldApplicationType,
                userId,
                request.ApplicationType,
                GetTokenSuffix(token));

            existing.UserId = userId;
            existing.ApplicationType = request.ApplicationType;
            existing.UpdatedAt = now;

            await dbContext.SaveChangesAsync(cancellationToken);

            if (shouldUnsubscribeOldTopic)
            {
                try
                {
                    await firebaseTopicSubscriptionService.UnsubscribeAsync(token, oldApplicationType, oldUserId, cancellationToken);
                    logger.LogInformation(
                        "Unsubscribed token from previous topic after reassignment. PreviousUserId={PreviousUserId}; PreviousApplicationType={PreviousApplicationType}; TokenSuffix={TokenSuffix}",
                        oldUserId,
                        oldApplicationType,
                        GetTokenSuffix(token));
                }
                catch (Exception exception)
                {
                    logger.LogWarning(exception, "Failed to unsubscribe token from old topic during reassignment.");
                }
            }
        }

        await SubscribeWithRetryAsync(token, request.ApplicationType, userId, cancellationToken);
        logger.LogInformation(
            "Push token registration completed. UserId={UserId}; ApplicationType={ApplicationType}; Topic={Topic}; TokenSuffix={TokenSuffix}",
            existing.UserId,
            existing.ApplicationType,
            firebaseTopicSubscriptionService.ResolveTopic(existing.ApplicationType, existing.UserId),
            GetTokenSuffix(existing.Token));

        return new PushTokenRegistrationResponse
        {
            UserId = existing.UserId,
            ApplicationType = existing.ApplicationType,
            Token = existing.Token,
            Topic = firebaseTopicSubscriptionService.ResolveTopic(existing.ApplicationType, existing.UserId),
            UpdatedAt = existing.UpdatedAt
        };
    }

    public async Task UnregisterAsync(Guid userId, UnregisterPushTokenRequest request, CancellationToken cancellationToken)
    {
        var token = NormalizeToken(request.Token);
        logger.LogInformation(
            "Unregistering push token. UserId={UserId}; ApplicationType={ApplicationType}; TokenSuffix={TokenSuffix}",
            userId,
            request.ApplicationType,
            GetTokenSuffix(token));
        var existing = await dbContext.PushTokenRegistrations
            .SingleOrDefaultAsync(
                x => x.Token == token && x.UserId == userId && x.ApplicationType == request.ApplicationType,
                cancellationToken);

        if (existing == null)
        {
            logger.LogWarning(
                "Push token unregister requested but registration not found. UserId={UserId}; ApplicationType={ApplicationType}; TokenSuffix={TokenSuffix}",
                userId,
                request.ApplicationType,
                GetTokenSuffix(token));
            return;
        }

        dbContext.PushTokenRegistrations.Remove(existing);
        await dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            await firebaseTopicSubscriptionService.UnsubscribeAsync(token, request.ApplicationType, userId, cancellationToken);
            logger.LogInformation(
                "Push token unregistered and unsubscribed successfully. UserId={UserId}; ApplicationType={ApplicationType}; TokenSuffix={TokenSuffix}",
                userId,
                request.ApplicationType,
                GetTokenSuffix(token));
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Failed to unsubscribe token from topic on unregister.");
        }
    }

    private static string NormalizeToken(string token)
    {
        var normalized = token.Trim();
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ArgumentException("Token is required.");
        }

        if (normalized.Length > MaxTokenLength)
        {
            throw new ArgumentException("Token is too long.");
        }

        return normalized;
    }

    private async Task SubscribeWithRetryAsync(string token, ApplicationType applicationType, Guid userId, CancellationToken cancellationToken)
    {
        var delays = new[] { 0, 500, 1500 };
        Exception? lastException = null;

        foreach (var delay in delays)
        {
            if (delay > 0)
            {
                await Task.Delay(delay, cancellationToken);
            }

            try
            {
                await firebaseTopicSubscriptionService.SubscribeAsync(token, applicationType, userId, cancellationToken);
                logger.LogInformation(
                    "Firebase topic subscribe succeeded. UserId={UserId}; ApplicationType={ApplicationType}; Attempt={Attempt}; TokenSuffix={TokenSuffix}",
                    userId,
                    applicationType,
                    Array.IndexOf(delays, delay) + 1,
                    GetTokenSuffix(token));
                return;
            }
            catch (FirebaseSubscriptionUnavailableException exception)
            {
                logger.LogError(
                    exception,
                    "Firebase topic subscription is unavailable. UserId={UserId}; ApplicationType={ApplicationType}; Attempt={Attempt}; TokenSuffix={TokenSuffix}",
                    userId,
                    applicationType,
                    Array.IndexOf(delays, delay) + 1,
                    GetTokenSuffix(token));
                throw;
            }
            catch (Exception exception)
            {
                lastException = exception;
                logger.LogWarning(
                    exception,
                    "Firebase topic subscribe failed. UserId={UserId}; ApplicationType={ApplicationType}; Attempt={Attempt}; TokenSuffix={TokenSuffix}",
                    userId,
                    applicationType,
                    Array.IndexOf(delays, delay) + 1,
                    GetTokenSuffix(token));
            }
        }

        if (lastException is not null)
        {
            throw new InvalidOperationException("Failed to subscribe device token to Firebase topic.", lastException);
        }
    }

    private static string GetTokenSuffix(string token)
    {
        return token.Length <= 12 ? token : token[^12..];
    }
}
