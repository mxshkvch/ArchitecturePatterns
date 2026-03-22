using System.Text.Json;
using BffService.Abstractions;
using BffService.Data;
using BffService.DTOs.Requests;
using BffService.DTOs.Responses;
using BffService.Entities;
using BffService.Enums;
using Microsoft.EntityFrameworkCore;

namespace BffService.Services;

public sealed class UserSettingsService(BffDbContext dbContext) : IUserSettingsService
{
    public async Task<UserSettingsResponse> GetAsync(Guid userId, ApplicationType applicationType, CancellationToken cancellationToken)
    {
        var settings = await dbContext.UserSettings
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.UserId == userId && x.ApplicationType == applicationType, cancellationToken);

        if (settings == null)
        {
            var created = new UserSettings
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ApplicationType = applicationType,
                Theme = ThemeType.LIGHT,
                HiddenAccountIdsJson = "[]",
                UpdatedAt = DateTimeOffset.UtcNow
            };

            dbContext.UserSettings.Add(created);
            await dbContext.SaveChangesAsync(cancellationToken);
            return Map(created);
        }

        return Map(settings);
    }

    public async Task<UserSettingsResponse> UpsertAsync(Guid userId, UpsertUserSettingsRequest request, CancellationToken cancellationToken)
    {
        if (request.HiddenAccountIds.Count > 1000)
        {
            throw new ArgumentException("Too many hidden accounts");
        }

        var hiddenIds = request.HiddenAccountIds.Distinct().ToArray();
        var hiddenIdsJson = JsonSerializer.Serialize(hiddenIds);

        var settings = await dbContext.UserSettings
            .SingleOrDefaultAsync(x => x.UserId == userId && x.ApplicationType == request.ApplicationType, cancellationToken);

        if (settings == null)
        {
            settings = new UserSettings
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ApplicationType = request.ApplicationType,
                Theme = request.Theme,
                HiddenAccountIdsJson = hiddenIdsJson,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            dbContext.UserSettings.Add(settings);
        }
        else
        {
            settings.Theme = request.Theme;
            settings.HiddenAccountIdsJson = hiddenIdsJson;
            settings.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(settings);
    }

    private static UserSettingsResponse Map(UserSettings settings)
    {
        var hiddenIds = JsonSerializer.Deserialize<Guid[]>(settings.HiddenAccountIdsJson) ?? Array.Empty<Guid>();

        return new UserSettingsResponse
        {
            UserId = settings.UserId,
            ApplicationType = settings.ApplicationType,
            Theme = settings.Theme,
            HiddenAccountIds = hiddenIds,
            UpdatedAt = settings.UpdatedAt
        };
    }
}
