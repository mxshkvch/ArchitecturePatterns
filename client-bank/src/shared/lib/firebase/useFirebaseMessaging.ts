import { useEffect, useRef } from "react";
import { messaging } from "./firebase";
import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { registerPushToken } from "../api/pushNotifications";
import {
  buildNotificationOptions,
  normalizePushNotification,
  resolveNotificationDeduplicationKey,
} from "./notificationPayload";

interface UseFirebaseMessagingInitParams {
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;
}

const CLIENT_APP_TYPE = "CLIENT";
const FCM_TOKEN_STORAGE_KEY = "client_fcm_token";
const FOREGROUND_DEDUPLICATION_WINDOW_MS = 60_000;

export const useFirebaseMessagingInit = ({ isAuthenticated, isLoading, authToken }: UseFirebaseMessagingInitParams) => {
  const recentNotificationKeysRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const cleanupStaleNotificationKeys = (now: number): void => {
      recentNotificationKeysRef.current.forEach((timestamp, key) => {
        if (now - timestamp > FOREGROUND_DEDUPLICATION_WINDOW_MS) {
          recentNotificationKeysRef.current.delete(key);
        }
      });
    };

    const shouldSkipDuplicate = (deduplicationKey: string): boolean => {
      const now = Date.now();
      cleanupStaleNotificationKeys(now);

      const seenAt = recentNotificationKeysRef.current.get(deduplicationKey);
      if (seenAt && now - seenAt < FOREGROUND_DEDUPLICATION_WINDOW_MS) {
        return true;
      }

      recentNotificationKeysRef.current.set(deduplicationKey, now);
      return false;
    };

    const showForegroundNotification = async (payload: MessagePayload): Promise<void> => {
      if (Notification.permission !== "granted") {
        return;
      }

      const notification = normalizePushNotification(payload);
      const deduplicationKey = resolveNotificationDeduplicationKey(notification);
      if (shouldSkipDuplicate(deduplicationKey)) {
        return;
      }

      const options = buildNotificationOptions(notification);

      try {
        const registration =
          (await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js")) ??
          (await navigator.serviceWorker.ready);

        await registration.showNotification(notification.title, options);
      } catch {
        new Notification(notification.title, options);
      }
    };

    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      console.log("foreground message:", payload);
      void showForegroundNotification(payload);
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
