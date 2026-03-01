FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/CreditService/CreditService/CreditService.csproj", "src/CreditService/CreditService/"]
RUN dotnet restore "src/CreditService/CreditService/CreditService.csproj"
COPY . .
WORKDIR "/src/src/CreditService/CreditService"

RUN dotnet build "CreditService.csproj" -c Release

RUN dotnet tool install -g dotnet-ef --version 8.0.4
ENV PATH="$PATH:/root/.dotnet/tools"

RUN dotnet ef migrations bundle -c CreditDbContext -o /app/publish/efbundle --configuration Release

RUN dotnet publish "CreditService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
RUN echo '#!/bin/bash' > entrypoint.sh && \
    echo './efbundle --connection "$ConnectionStrings__DefaultConnection"' >> entrypoint.sh && \
    echo 'exec dotnet CreditService.dll' >> entrypoint.sh && \
    chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]