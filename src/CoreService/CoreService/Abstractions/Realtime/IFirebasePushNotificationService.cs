using CoreService.Messaging;

namespace CoreService.Abstractions.Realtime;

public interface IFirebasePushNotificationService
{
    Task NotifyOperationUpdatedAsync(AccountOperationMessage message, DateTimeOffset occurredAt, CancellationToken cancellationToken);
}
