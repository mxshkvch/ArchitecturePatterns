import { useEffect } from "react";
import { messaging } from "./firebase";
import { getToken, onMessage, type MessagePayload } from "firebase/messaging";

export const useFirebaseMessagingInit = () => {
  useEffect(() => {
    console.log("Firebase init start");

    Notification.requestPermission().then(async (permission) => {
      console.log("permission:", permission);

      if (permission !== "granted") return;

      try {
        const registration = await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
          vapidKey: "BEbQ34U1nl7rl7cEcjBWQR2OzetJELFZepZZiNxMzvBa_huNsj7_8mTD3dyF4Qu0LIKIY6CHX57ZSc3YA_HDBX8",
          serviceWorkerRegistration: registration,
        });

        console.log("FCM TOKEN:", token);
      } catch (e) {
        console.error("getToken error:", e);
      }
    });

    onMessage(messaging, (payload: MessagePayload) => {
      console.log("foreground message:", payload);
    });
  }, []);
};