using System.Text.Json.Serialization;

namespace CreditService.Services.Models
{
    public class AccountResponse
    {
        public Guid Id { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public decimal Balance { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        [JsonConverter(typeof(NullableDateTimeConverter))]
        public DateTime? ClosedAt { get; set; }
        public TransactionType? transactionType { get; set; }
    }
}
