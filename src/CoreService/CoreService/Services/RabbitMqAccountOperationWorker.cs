using System.Text.Json;
using CoreService.Abstractions;
using CoreService.Abstractions.Realtime;
using CoreService.Configurations;
using CoreService.Messaging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace CoreService.Services;

public sealed class RabbitMqAccountOperationWorker(
    IConnection rabbitMqConnection,
    IServiceScopeFactory serviceScopeFactory,
    IOperationNotificationService operationNotificationService,
    IOptions<RabbitMqOptions> options,
    ILogger<RabbitMqAccountOperationWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var queueName = options.Value.QueueName;

        await using var channel = await rabbitMqConnection.CreateChannelAsync(cancellationToken: stoppingToken);

        await channel.QueueDeclareAsync(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            noWait: false,
            cancellationToken: stoppingToken);

        await channel.BasicQosAsync(0, 10, false, stoppingToken);

        var consumer = new AsyncEventingBasicConsumer(channel);

        consumer.ReceivedAsync += async (sender, eventArgs) =>
        {
            try
            {
                var message = JsonSerializer.Deserialize<AccountOperationMessage>(eventArgs.Body.Span);
                if (message == null)
                {
                    logger.LogError("Invalid operation payload, discarding message");
                    await channel.BasicAckAsync(eventArgs.DeliveryTag, false, stoppingToken);
                    return;
                }

                using var scope = serviceScopeFactory.CreateScope();
                var processor = scope.ServiceProvider.GetRequiredService<IAccountOperationProcessor>();

                await processor.ProcessAsync(message, stoppingToken);
                await operationNotificationService.NotifyOperationInvalidatedAsync(message, stoppingToken);
                await channel.BasicAckAsync(eventArgs.DeliveryTag, false, stoppingToken);
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Failed to process account operation message, discarding");
                await channel.BasicAckAsync(eventArgs.DeliveryTag, false, stoppingToken);
            }
        };

        await channel.BasicConsumeAsync(
            queue: queueName,
            autoAck: false,
            consumer: consumer,
            cancellationToken: stoppingToken);

        await Task.Delay(Timeout.Infinite, stoppingToken);
    }
}
