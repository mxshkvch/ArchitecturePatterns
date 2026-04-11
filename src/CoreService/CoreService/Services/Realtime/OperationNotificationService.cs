using CoreService.Abstractions.Realtime;
using CoreService.Hubs;
using CoreService.Messaging;
using Microsoft.AspNetCore.SignalR;

namespace CoreService.Services.Realtime;

public sealed class OperationNotificationService(
    IHubContext<OperationsHub> hubContext,
    IFirebasePushNotificationService firebasePushNotificationService,
    ILogger<OperationNotificationService> logger) : IOperationNotificationService
{
    public async Task NotifyOperationInvalidatedAsync(AccountOperationMessage message, CancellationToken cancellationToken)
    {
        var occurredAt = DateTimeOffset.UtcNow;
        var payload = new
        {
            type = "operation_invalidation",
            operationId = message.OperationId,
            idempotencyKey = message.IdempotencyKey,
            operationType = message.OperationType.ToString(),
            accountId = message.AccountId,
            targetAccountId = message.TargetAccountId,
            userId = message.UserId,
            targetUserId = message.TargetUserId,
            amount = message.Amount,
            createdAt = message.CreatedAt,
            occurredAt
        };

        try
        {
            await hubContext.Clients.Group($"user:{message.UserId}").SendAsync("operationUpdated", payload, cancellationToken);
            await hubContext.Clients.Group("employees").SendAsync("operationUpdated", payload, cancellationToken);

            if (message.TargetUserId.HasValue && message.TargetUserId.Value != message.UserId)
            {
                await hubContext.Clients.Group($"user:{message.TargetUserId.Value}").SendAsync("operationUpdated", payload, cancellationToken);
            }
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Failed to deliver SignalR operation notification for operation {OperationId}", message.OperationId);
        }

        await firebasePushNotificationService.NotifyOperationUpdatedAsync(message, occurredAt, cancellationToken);
    }
}
