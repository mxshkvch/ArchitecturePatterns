namespace CoreService.DTOs.Responses;

public class PagedResponse<T>
{
    public List<T> Content { get; set; } = new List<T>();
    public PageInfo Page { get; set; } = new PageInfo();
}