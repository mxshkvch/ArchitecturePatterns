import { useEffect } from "react";
import { messaging } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";
import { registerPushToken } from "../api/pushNotifications";

interface Props {
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;
}

export const useFirebaseMessagingInit = ({isAuthenticated, isLoading, authToken}: Props) => {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("[FCM] Foreground push received:", payload);

      const title = payload.notification?.title ?? "Уведомление";
      const body = payload.notification?.body ?? "";

      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/vite.svg",
          data: payload.data,
        });
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !authToken) return;

    const init = async () => {
      console.log("[FCM] Init start");

      const permission = await Notification.requestPermission();
      console.log("[FCM] Permission:", permission);

      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey:
          "BEbQ34U1nl7rl7cEcjBWQR2OzetJELFZepZZiNxMzvBa_huNsj7_8mTD3dyF4Qu0LIKIY6CHX57ZSc3YA_HDBX8",
        serviceWorkerRegistration: registration,
      });

      console.log("[FCM] Token:", token ? "OK" : "EMPTY");

      if (!token) return;

      await registerPushToken(token, "CLIENT", authToken);

      localStorage.setItem("client_fcm_token", token);

      console.log("[FCM] Token registered");
    };

    init();
  }, [isAuthenticated, isLoading, authToken]);
};