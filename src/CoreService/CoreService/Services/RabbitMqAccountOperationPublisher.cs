using System.Text.Json;
using CoreService.Abstractions;
using CoreService.Configurations;
using CoreService.Messaging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace CoreService.Services;

public sealed class RabbitMqAccountOperationPublisher(
    IConnection rabbitMqConnection,
    IOptions<RabbitMqOptions> options) : IAccountOperationPublisher
{
    public async Task PublishAsync(AccountOperationMessage message, CancellationToken cancellationToken)
    {
        var queueName = options.Value.QueueName;
        var payload = JsonSerializer.SerializeToUtf8Bytes(message);

        await using var channel = await rabbitMqConnection.CreateChannelAsync(cancellationToken: cancellationToken);

        await channel.QueueDeclareAsync(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            noWait: false,
            cancellationToken: cancellationToken);

        var properties = new BasicProperties
        {
            Persistent = true,
            ContentType = "application/json"
        };

        await channel.BasicPublishAsync(
            exchange: string.Empty,
            routingKey: queueName,
            mandatory: true,
            basicProperties: properties,
            body: new ReadOnlyMemory<byte>(payload),
            cancellationToken: cancellationToken);
    }
}
