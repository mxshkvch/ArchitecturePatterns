We will do the most greatest patterns you have ever seen.

CoreService operation notifications are delivered through SignalR and Firebase Cloud Messaging (FCM). Configure Firebase in `src/CoreService/CoreService/appsettings.json` or environment variables:
- `FirebasePush__Enabled=true`
- `FirebasePush__ProjectId=<firebase-project-id>`
- `FirebasePush__CredentialsFilePath=<absolute-path-to-service-account-json>` or `FirebasePush__CredentialsJson=<service-account-json>`
- `FirebasePush__ClientTopicPrefix=user-`
- `FirebasePush__StaffTopic=employees`
