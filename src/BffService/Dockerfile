FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/BffService/BffService/BffService.csproj src/BffService/BffService/
RUN dotnet restore src/BffService/BffService/BffService.csproj
COPY . .
RUN dotnet publish src/BffService/BffService/BffService.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY architecturepatterns-d92c3-firebase-adminsdk-fbsvc-54adf1e762.json /app/secrets/firebase-service-account.json
ENV ASPNETCORE_URLS=http://+:8080
ENV FirebasePush__Enabled=true \
    FirebasePush__ProjectId=architecturepatterns-d92c3 \
    FirebasePush__CredentialsFilePath=/app/secrets/firebase-service-account.json \
    FirebasePush__ClientTopicPrefix=user- \
    FirebasePush__StaffTopic=employees
EXPOSE 8080
ENTRYPOINT ["dotnet", "BffService.dll"]
