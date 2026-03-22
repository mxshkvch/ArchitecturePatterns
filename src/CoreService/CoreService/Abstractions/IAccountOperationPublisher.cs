using CoreService.Messaging;

namespace CoreService.Abstractions;

public interface IAccountOperationPublisher
{
    Task PublishAsync(AccountOperationMessage message, CancellationToken cancellationToken);
}
