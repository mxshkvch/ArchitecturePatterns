using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CoreService.Hubs;

[Authorize]
public sealed class OperationsHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = Context.User?.FindFirstValue(ClaimTypes.Role);

        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");
        }

        if (role is "ADMIN" or "EMPLOYEE")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "employees");
        }

        await base.OnConnectedAsync();
    }
}
