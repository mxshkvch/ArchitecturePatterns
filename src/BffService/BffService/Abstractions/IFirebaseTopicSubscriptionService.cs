using BffService.Enums;

namespace BffService.Abstractions;

public interface IFirebaseTopicSubscriptionService
{
    string ResolveTopic(ApplicationType applicationType, Guid userId);
    Task SubscribeAsync(string token, ApplicationType applicationType, Guid userId, CancellationToken cancellationToken);
    Task UnsubscribeAsync(string token, ApplicationType applicationType, Guid userId, CancellationToken cancellationToken);
}
