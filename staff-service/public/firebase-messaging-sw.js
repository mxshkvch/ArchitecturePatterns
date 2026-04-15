ёimportScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAZmPJ36P4ZvhH5s24ygcqs-L3Y86MxGoU",
  authDomain: "architecturepatterns-d92c3.firebaseapp.com",
  projectId: "architecturepatterns-d92c3",
  storageBucket: "architecturepatterns-d92c3.firebasestorage.app",
  messagingSenderId: "375783130162",
  appId: "1:375783130162:web:5b9125de68b864cd2ee82b"
});

const messaging = firebase.messaging();

ъmessaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background push received:", payload);

  const title = payload.notification?.title ?? "Новое уведомление";
  const body = payload.notification?.body ?? "";
  const link = payload.fcmOptions?.link || payload.data?.link || "/";

  self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {
      url: link,
      ...payload.data
    },
    vibrate: [200, 100, 200],
    requireInteraction: true
  });
});

// Обработка клика по уведомлению
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || "/";

  console.log("[SW] Notification click, opening:", url);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
