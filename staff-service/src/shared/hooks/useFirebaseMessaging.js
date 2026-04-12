import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/firebase';
import { registerPushToken } from '../../services/api/push/pushTokenService';
import { normalizeMessagingPayload } from '../firebase/notificationPayload';

const FCM_TOKEN_STORAGE_KEY = 'staff_fcm_token';
const MESSAGE_DEDUPE_TTL_MS = 15000;
const seenMessages = new Map();

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
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const normalized = normalizeMessagingPayload(payload);
  if (isDuplicateMessage(normalized.dedupeKey)) {
    return;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(normalized.title, normalized.options);
      return;
    }

    new Notification(normalized.title, normalized.options);
  } catch (error) {
    console.error('foreground notification display error:', error);
  }
};

export const useFirebaseMessaging = () => {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('foreground message:', payload);
      void showForegroundNotification(payload);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const authToken = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    if (!authToken || role !== 'staff') {
      return;
    }

    let isMounted = true;

    const init = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
          vapidKey: 'BEbQ34U1nl7rl7cEcjBWQR2OzetJELFZepZZiNxMzvBa_huNsj7_8mTD3dyF4Qu0LIKIY6CHX57ZSc3YA_HDBX8',
          serviceWorkerRegistration: registration,
        });

        if (!token || !isMounted) {
          return;
        }

        await registerPushToken(token);
        localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
        console.log('FCM token registered');
      } catch (error) {
        console.error('getToken/register push error:', error);
      }
    };

    void init();

    return () => {
      isMounted = false;
    };
  }, []);
};
