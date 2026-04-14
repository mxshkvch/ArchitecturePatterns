<<<<<<< HEAD
// src/shared/hooks/useFirebaseMessaging.js
import { useEffect } from "react";
import { messaging } from "../../services/firebase/config";
import { getToken, onMessage } from "firebase/messaging";
import { registerPushToken } from "../../services/api/pushNotifications";

export const useFirebaseMessaging = ({ isAuthenticated, isLoading, authToken, userRole }) => {
  // Слушаем уведомления, когда приложение открыто
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("[FCM] Foreground push received:", payload);

      const title = payload.notification?.title ?? "Новое уведомление";
      const body = payload.notification?.body ?? "";

      if (Notification.permission === "granted") {
        // Показываем уведомление
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          data: payload.data,
        });
      }

      // Отправляем событие для UI компонентов
      const event = new CustomEvent('new-notification', {
        detail: {
          title: title,
          body: body,
          data: payload.data,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(event);
    });

    return unsubscribe;
  }, [isAuthenticated]);

  // Инициализация FCM и регистрация токена
  useEffect(() => {
    if (isLoading || !isAuthenticated || !authToken) return;

    const init = async () => {
      console.log("[FCM] Initializing for staff user...");

      // Проверяем, что это сотрудник
      const isStaff = userRole === 'EMPLOYEE' || userRole === 'EMPLOYEE';
      if (!isStaff) {
        console.log("[FCM] Not a staff user, skipping...");
        return;
      }

      // Запрашиваем разрешение
      const permission = await Notification.requestPermission();
      console.log("[FCM] Permission:", permission);

      if (permission !== "granted") {
        console.warn("[FCM] Notification permission denied");
        return;
      }

      // Ждем готовности Service Worker
      const registration = await navigator.serviceWorker.ready;
      console.log("[FCM] Service Worker ready");

      // Получаем FCM токен
      const token = await getToken(messaging, {
        vapidKey: "BEbQ34U1nl7rl7cEcjBWQR2OzetJELFZepZZiNxMzvBa_huNsj7_8mTD3dyF4Qu0LIKIY6CHX57ZSc3YA_HDBX8",
        serviceWorkerRegistration: registration,
      });

      console.log("[FCM] Token received:", token ? "OK" : "EMPTY");

      if (!token) return;

      // Регистрируем токен на бэкенде
      await registerPushToken(token, "STAFF", authToken);

      // Сохраняем токен в localStorage
      localStorage.setItem("staff_fcm_token", token);

      console.log("[FCM] Token registered for staff user");
    };

    init();
  }, [isAuthenticated, isLoading, authToken, userRole]);
};
=======
import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/firebase';
import { registerPushToken } from '../../services/api/push/pushTokenService';
import { normalizeMessagingPayload } from '../firebase/notificationPayload';

const FCM_TOKEN_STORAGE_KEY = 'staff_fcm_token';
const MESSAGE_DEDUPE_TTL_MS = 15000;
const seenMessages = new Map();
const toTokenSuffix = (token) => token.slice(-12);

const isDuplicateMessage = (messageKey) => {
  if (!messageKey) {
    return false;
  }

  const now = Date.now();

  for (const [key, timestamp] of seenMessages.entries()) {
    if (now - timestamp > MESSAGE_DEDUPE_TTL_MS) {
      seenMessages.delete(key);
    }
  }

  const previous = seenMessages.get(messageKey);
  if (previous && now - previous < MESSAGE_DEDUPE_TTL_MS) {
    return true;
  }

  seenMessages.set(messageKey, now);
  return false;
};

const showForegroundNotification = async (payload) => {
  if (!('Notification' in window)) {
    console.warn('[push][staff] Notification API unavailable in browser');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[push][staff] Foreground notification skipped due to permission', {
      permission: Notification.permission,
    });
    return;
  }

  const normalized = normalizeMessagingPayload(payload);
  if (isDuplicateMessage(normalized.dedupeKey)) {
    console.log('[push][staff] Foreground duplicate skipped', {
      dedupeKey: normalized.dedupeKey,
      messageId: normalized.options?.data?.messageId || '',
      tag: normalized.options?.tag || '',
    });
    return;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(normalized.title, normalized.options);
      console.log('[push][staff] Foreground notification displayed via service worker', {
        title: normalized.title,
        tag: normalized.options?.tag || '',
      });
      return;
    }

    new Notification(normalized.title, normalized.options);
    console.log('[push][staff] Foreground notification displayed via Notification API fallback', {
      title: normalized.title,
      tag: normalized.options?.tag || '',
    });
  } catch (error) {
    console.error('[push][staff] Foreground notification display error', error);
  }
};

export const useFirebaseMessaging = () => {
  useEffect(() => {
    console.log('[push][staff] Foreground listener setup');

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[push][staff] Foreground message received', {
        messageId: payload?.messageId,
        hasNotification: Boolean(payload?.notification),
        dataKeys: Object.keys(payload?.data || {}),
      });
      void showForegroundNotification(payload);
    });

    return () => {
      console.log('[push][staff] Foreground listener cleanup');
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const authToken = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    if (!authToken || role !== 'staff') {
      console.log('[push][staff] Firebase init skipped', {
        hasAuthToken: Boolean(authToken),
        role,
      });
      return;
    }

    let isMounted = true;

    const init = async () => {
      console.log('[push][staff] Firebase init start');

      const permission = await Notification.requestPermission();
      console.log('[push][staff] Notification permission result', { permission });
      if (permission !== 'granted') {
        console.warn('[push][staff] Firebase init stopped because permission was not granted', { permission });
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        console.log('[push][staff] Service worker ready for FCM token request', {
          scope: registration.scope,
          activeState: registration.active?.state,
        });

        const token = await getToken(messaging, {
          vapidKey: 'BEbQ34U1nl7rl7cEcjBWQR2OzetJELFZepZZiNxMzvBa_huNsj7_8mTD3dyF4Qu0LIKIY6CHX57ZSc3YA_HDBX8',
          serviceWorkerRegistration: registration,
        });

        if (!token || !isMounted) {
          console.warn('[push][staff] FCM token registration skipped', {
            hasToken: Boolean(token),
            isMounted,
          });
          return;
        }

        console.log('[push][staff] FCM token received', {
          tokenSuffix: toTokenSuffix(token),
        });
        await registerPushToken(token);
        localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        console.log('[push][staff] FCM token registered in backend and stored locally', {
          tokenSuffix: toTokenSuffix(token),
        });
      } catch (error) {
        console.error('[push][staff] getToken/register push error', error);
      }
    };

    void init();

    return () => {
      isMounted = false;
      console.log('[push][staff] Firebase init cleanup');
    };
  }, []);
};
>>>>>>> 1906bcc9329792fe31c7a12b5bd5c2aa79efa88b
