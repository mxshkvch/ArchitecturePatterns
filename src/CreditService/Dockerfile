FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/CreditService/CreditService/CreditService.csproj", "src/CreditService/CreditService/"]
RUN dotnet restore "src/CreditService/CreditService/CreditService.csproj"

COPY . .
WORKDIR "/src/src/CreditService/CreditService"

RUN dotnet build "CreditService.csproj" -c Release
RUN dotnet publish "CreditService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "CreditService.dll"]