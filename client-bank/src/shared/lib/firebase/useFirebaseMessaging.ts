import { useEffect } from "react";
import { messaging } from "./firebase";
import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { registerPushToken } from "../api/pushNotifications";

interface UseFirebaseMessagingInitParams {
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;
}

const CLIENT_APP_TYPE = "CLIENT";
const FCM_TOKEN_STORAGE_KEY = "client_fcm_token";

export const useFirebaseMessagingInit = ({ isAuthenticated, isLoading, authToken }: UseFirebaseMessagingInitParams) => {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      console.log("foreground message:", payload);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !authToken) {
      return;
    }

    let isMounted = true;

    const init = async () => {
      console.log("Firebase init start");

      const permission = await Notification.requestPermission();
      console.log("permission:", permission);
      if (permission !== "granted") {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
          vapidKey: "BEbQ34U1nl7rl7cEcjBWQR2OzetJELFZepZZiNxMzvBa_huNsj7_8mTD3dyF4Qu0LIKIY6CHX57ZSc3YA_HDBX8",
          serviceWorkerRegistration: registration,
        });

        if (!token || !isMounted) {
          return;
        }

        await registerPushToken(token, CLIENT_APP_TYPE, authToken);
        localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        console.log("FCM token registered");
      } catch (error) {
        console.error("getToken/register push error:", error);
      }
    };

    void init();

    return () => {
      isMounted = false;
    };
  }, [authToken, isAuthenticated, isLoading]);
};
