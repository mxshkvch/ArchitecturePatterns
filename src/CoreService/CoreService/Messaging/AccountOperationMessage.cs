namespace CoreService.Messaging;

public sealed class AccountOperationMessage
{
    public Guid OperationId { get; set; }
    public string? IdempotencyKey { get; set; }
    public AccountOperationType OperationType { get; set; }
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public Guid? TargetAccountId { get; set; }
    public Guid? TargetUserId { get; set; }
    public decimal Amount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
