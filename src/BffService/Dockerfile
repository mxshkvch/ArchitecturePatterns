FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/BffService/BffService/BffService.csproj src/BffService/BffService/
RUN dotnet restore src/BffService/BffService/BffService.csproj
COPY . .
RUN dotnet publish src/BffService/BffService/BffService.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "BffService.dll"]
