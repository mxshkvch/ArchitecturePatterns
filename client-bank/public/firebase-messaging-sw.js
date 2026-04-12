importScripts("https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAZmPJ36P4ZvhH5s24ygcqs-L3Y86MxGoU",
  authDomain: "architecturepatterns-d92c3.firebaseapp.com",
  projectId: "architecturepatterns-d92c3",
  storageBucket: "architecturepatterns-d92c3.firebasestorage.app",
  messagingSenderId: "375783130162",
  appId: "1:375783130162:web:5b9125de68b864cd2ee82b"
});

const messaging = firebase.messaging();
const DEFAULT_TITLE = "Банковское уведомление";
const DEFAULT_BODY = "У вас новое событие в приложении банка.";
const DEFAULT_ICON = "/vite.svg";
const DEDUPLICATION_WINDOW_MS = 60 * 1000;
const recentMessageKeys = new Map();

const toStringMap = (data) => {
  if (!data) {
    return {};
  }

  return Object.entries(data).reduce((acc, [key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      acc[key] = value;
    }

    return acc;
  }, {});
};

const formatFallbackBody = (data) => {
  const parts = [
    data.operationType ? `Операция: ${data.operationType}` : "",
    data.amount ? `Сумма: ${data.amount}${data.currency ? ` ${data.currency}` : ""}` : "",
    data.status ? `Статус: ${data.status}` : "",
  ].filter(Boolean);

  return parts.join(". ") || DEFAULT_BODY;
};

const normalizePayload = (payload) => {
  const data = toStringMap(payload.data);
  const title = payload.notification?.title || data.title || (data.operationType ? `Операция: ${data.operationType}` : DEFAULT_TITLE);
  const body = payload.notification?.body || data.body || formatFallbackBody(data);
  const messageId = payload.messageId || data.messageId || data.googleMessageId || null;
  const tag =
    data.tag ||
    data.operationId ||
    data.transactionId ||
    messageId ||
    (data.operationType ? `operation-${data.operationType}` : "client-bank");

  return {
    title,
    body,
    tag,
    messageId,
    url: data.url || data.link || payload.fcmOptions?.link || "/",
    icon: payload.notification?.icon || data.icon || DEFAULT_ICON,
    image: payload.notification?.image || data.image,
    data,
  };
};

const shouldSkipDuplicate = (key) => {
  const now = Date.now();

  for (const [messageKey, timestamp] of recentMessageKeys.entries()) {
    if (now - timestamp > DEDUPLICATION_WINDOW_MS) {
      recentMessageKeys.delete(messageKey);
    }
  }

  const existingTimestamp = recentMessageKeys.get(key);
  if (existingTimestamp && now - existingTimestamp < DEDUPLICATION_WINDOW_MS) {
    return true;
  }

  recentMessageKeys.set(key, now);
  return false;
};

messaging.onBackgroundMessage((payload) => {
  const notification = normalizePayload(payload);
  const dedupeKey = notification.messageId || notification.tag;

  if (shouldSkipDuplicate(dedupeKey)) {
    return;
  }

  self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: notification.icon,
    image: notification.image,
    tag: notification.tag,
    renotify: false,
    data: {
      ...notification.data,
      url: notification.url,
      messageId: notification.messageId || "",
    },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const relativeUrl = event.notification?.data?.url || "/";
  const targetUrl = new URL(relativeUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        const sameUrl = client.url === targetUrl;
        const sameOriginPath = new URL(client.url).pathname === new URL(targetUrl).pathname;

        if (sameUrl || sameOriginPath) {
          return client.focus();
        }
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});
