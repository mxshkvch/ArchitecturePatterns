FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["src/AuthService/AuthService/AuthService.csproj", "src/AuthService/AuthService/"]
RUN dotnet restore "src/AuthService/AuthService/AuthService.csproj"
COPY . .
WORKDIR "/src/src/AuthService/AuthService"

RUN dotnet build "AuthService.csproj" -c Release

RUN dotnet tool install -g dotnet-ef --version 10.0.3
ENV PATH="$PATH:/root/.dotnet/tools"

RUN dotnet ef migrations bundle -c AuthDbContext -o /app/publish/efbundle --configuration Release

RUN dotnet publish "AuthService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
RUN echo '#!/bin/bash' > entrypoint.sh && \
    echo './efbundle --connection "$ConnectionStrings__DefaultConnection"' >> entrypoint.sh && \
    echo 'exec dotnet AuthService.dll' >> entrypoint.sh && \
    chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
