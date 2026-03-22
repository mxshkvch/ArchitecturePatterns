using CoreService.Messaging;

namespace CoreService.Abstractions;

public interface IAccountOperationProcessor
{
    Task ProcessAsync(AccountOperationMessage message, CancellationToken cancellationToken);
}
