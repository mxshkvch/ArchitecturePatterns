using CoreService.Abstractions.Realtime;
using CoreService.Hubs;
using CoreService.Messaging;
using Microsoft.AspNetCore.SignalR;

namespace CoreService.Services.Realtime;

public sealed class OperationNotificationService(IHubContext<OperationsHub> hubContext) : IOperationNotificationService
{
    public async Task NotifyOperationInvalidatedAsync(AccountOperationMessage message, CancellationToken cancellationToken)
    {
        var payload = new
        {
            type = "operation_invalidation",
            operationId = message.OperationId,
            operationType = message.OperationType.ToString(),
            accountId = message.AccountId,
            targetAccountId = message.TargetAccountId,
            userId = message.UserId,
            occurredAt = DateTimeOffset.UtcNow
        };

        await hubContext.Clients.Group($"user:{message.UserId}").SendAsync("operationUpdated", payload, cancellationToken);
        await hubContext.Clients.Group("employees").SendAsync("operationUpdated", payload, cancellationToken);
    }
}
