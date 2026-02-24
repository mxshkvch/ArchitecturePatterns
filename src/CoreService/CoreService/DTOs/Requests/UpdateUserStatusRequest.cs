using CoreService.Enums;

namespace CoreService.DTOs.Requests;

public class UpdateUserStatusRequest
{
    public UserStatus Status { get; set; }
}