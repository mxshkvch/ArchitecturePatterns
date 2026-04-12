import { useEffect, useRef } from "react";
import { messaging } from "./firebase";
import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { registerPushToken } from "../api/pushNotifications";
import {
  buildNotificationOptions,
  createNotificationCenterItem,
  normalizePushNotification,
  resolveNotificationDeduplicationKey,
  type NormalizedPushNotification,
} from "./notificationPayload";
import { addNotificationCenterItem } from "./notificationCenterStore";

interface UseFirebaseMessagingInitParams {
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;
}

const CLIENT_APP_TYPE = "CLIENT";
const FCM_TOKEN_STORAGE_KEY = "client_fcm_token";
const FOREGROUND_DEDUPLICATION_WINDOW_MS = 60_000;
const toTokenSuffix = (token: string): string => token.slice(-12);

export const useFirebaseMessagingInit = ({ isAuthenticated, isLoading, authToken }: UseFirebaseMessagingInitParams) => {
  const recentNotificationKeysRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    console.log("[push][client] Foreground listener setup");

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

    const showForegroundNotification = async (notification: NormalizedPushNotification): Promise<void> => {
      if (!("Notification" in window)) {
        console.warn("[push][client] Notification API unavailable in browser");
        return;
      }

      if (Notification.permission !== "granted") {
        console.warn("[push][client] Foreground notification skipped due to permission", {
          permission: Notification.permission,
        });
        return;
      }

      const options = buildNotificationOptions(notification);

      try {
        const registration =
          (await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js")) ??
          (await navigator.serviceWorker.ready);

        await registration.showNotification(notification.title, options);
        console.log("[push][client] Foreground notification displayed via service worker", {
          title: notification.title,
          messageId: notification.messageId,
          tag: notification.tag,
        });
      } catch (error) {
        console.warn("[push][client] Service worker notification display failed, using Notification fallback", error);
        new Notification(notification.title, options);
        console.log("[push][client] Foreground notification displayed via Notification API fallback", {
          title: notification.title,
          messageId: notification.messageId,
          tag: notification.tag,
        });
      }
    };

    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      console.log("[push][client] Foreground message received", {
        messageId: payload.messageId,
        hasNotification: Boolean(payload.notification),
        dataKeys: Object.keys(payload.data ?? {}),
      });
      const notification = normalizePushNotification(payload);
      const deduplicationKey = resolveNotificationDeduplicationKey(notification);
      if (shouldSkipDuplicate(deduplicationKey)) {
        console.log("[push][client] Foreground duplicate skipped", {
          deduplicationKey,
          messageId: notification.messageId,
          tag: notification.tag,
        });
        return;
      }

      addNotificationCenterItem(createNotificationCenterItem(notification));
      void showForegroundNotification(notification);
    });

    return () => {
      console.log("[push][client] Foreground listener cleanup");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !authToken) {
      console.log("[push][client] Firebase init skipped", {
        isLoading,
        isAuthenticated,
        hasAuthToken: Boolean(authToken),
      });
      return;
    }

    let isMounted = true;

    const init = async () => {
      console.log("[push][client] Firebase init start");

      const permission = await Notification.requestPermission();
      console.log("[push][client] Notification permission result", { permission });
      if (permission !== "granted") {
        console.warn("[push][client] Firebase init stopped because permission was not granted", { permission });
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        console.log("[push][client] Service worker ready for FCM token request", {
          scope: registration.scope,
          activeState: registration.active?.state,
        });

        const token = await getToken(messaging, {
          vapidKey: "BEbQ34U1nl7rl7cEcjBWQR2OzetJELFZepZZiNxMzvBa_huNsj7_8mTD3dyF4Qu0LIKIY6CHX57ZSc3YA_HDBX8",
          serviceWorkerRegistration: registration,
        });

        if (!token || !isMounted) {
          console.warn("[push][client] FCM token registration skipped", {
            hasToken: Boolean(token),
            isMounted,
          });
          return;
        }

        console.log("[push][client] FCM token received", {
          tokenSuffix: toTokenSuffix(token),
        });
        await registerPushToken(token, CLIENT_APP_TYPE, authToken);
        localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        console.log("[push][client] FCM token registered in backend and stored locally", {
          tokenSuffix: toTokenSuffix(token),
        });
      } catch (error) {
        console.error("[push][client] getToken/register push error", error);
      }
    };

    void init();

    return () => {
      isMounted = false;
      console.log("[push][client] Firebase init cleanup");
    };
  }, [authToken, isAuthenticated, isLoading]);
};
