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