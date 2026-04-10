import * as signalR from "@microsoft/signalr";

export const createConnection = (token: string) => {
  return new signalR.HubConnectionBuilder()
    .withUrl("http://89.23.105.66:5000/hubs/operations", {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();
};