FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["src/CoreService/CoreService/CoreService.csproj", "src/CoreService/CoreService/"]
RUN dotnet restore "src/CoreService/CoreService/CoreService.csproj"
COPY . .
WORKDIR "/src/src/CoreService/CoreService"
RUN dotnet tool install -g dotnet-ef --version 10.0.3
ENV PATH="$PATH:/root/.dotnet/tools"
RUN dotnet ef migrations bundle -c AppDbContext -o /app/publish/efbundle
RUN dotnet publish "CoreService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .
RUN echo '#!/bin/bash' > entrypoint.sh && \
    echo './efbundle --connection "$ConnectionStrings__DefaultConnection"' >> entrypoint.sh && \
    echo 'exec dotnet CoreService.dll' >> entrypoint.sh && \
    chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]