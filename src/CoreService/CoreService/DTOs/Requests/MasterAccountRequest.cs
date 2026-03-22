namespace CoreService.DTOs.Requests
{
    public class MasterAccountRequest
    {
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
