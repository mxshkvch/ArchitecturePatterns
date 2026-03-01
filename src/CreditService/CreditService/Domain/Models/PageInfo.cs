namespace CreditService.Domain.Models
{
    public class PageInfo
    {
        public int page { get; set; }
        public int size { get; set; }
        public int totalElements { get; set; }
        public int totalPages { get; set; }
    }
}
