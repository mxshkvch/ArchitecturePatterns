import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/firebase';
import { registerPushToken } from '../../services/api/push/pushTokenService';

const FCM_TOKEN_STORAGE_KEY = 'staff_fcm_token';

export const useFirebaseMessaging = () => {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('foreground message:', payload);
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
