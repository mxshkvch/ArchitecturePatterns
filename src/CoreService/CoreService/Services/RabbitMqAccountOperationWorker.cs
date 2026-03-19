using System.Text.Json;
using CoreService.Abstractions;
using CoreService.Abstractions.Realtime;
using CoreService.Configurations;
using CoreService.Messaging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

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

        while (!stoppingToken.IsCancellationRequested)
        {
            var result = await channel.BasicGetAsync(queue: queueName, autoAck: false, cancellationToken: stoppingToken);

            if (result == null)
            {
                await Task.Delay(200, stoppingToken);
                continue;
            }

            try
            {
                var message = JsonSerializer.Deserialize<AccountOperationMessage>(result.Body.Span);
                if (message == null)
                {
                    throw new InvalidOperationException("Invalid operation payload");
                }

                using var scope = serviceScopeFactory.CreateScope();
                var processor = scope.ServiceProvider.GetRequiredService<IAccountOperationProcessor>();

                await processor.ProcessAsync(message, stoppingToken);
                await operationNotificationService.NotifyOperationInvalidatedAsync(message, stoppingToken);
                await channel.BasicAckAsync(result.DeliveryTag, false, stoppingToken);
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Failed to process account operation message");
                await channel.BasicNackAsync(result.DeliveryTag, false, true, stoppingToken);
            }
        }
    }
}
