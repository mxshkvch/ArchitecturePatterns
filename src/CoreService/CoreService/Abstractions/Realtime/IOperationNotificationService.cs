using CoreService.Messaging;

namespace CoreService.Abstractions.Realtime;

public interface IOperationNotificationService
{
    Task NotifyOperationInvalidatedAsync(AccountOperationMessage message, CancellationToken cancellationToken);
}
