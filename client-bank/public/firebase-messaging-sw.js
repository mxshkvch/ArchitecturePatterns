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

messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background push received:", payload);

  const title = payload.notification?.title ?? "Уведомление";
  const body = payload.notification?.body ?? "";

  self.registration.showNotification(title, {
    body,
    icon: "/vite.svg",
    data: {
      url: payload?.fcmOptions?.link || "/",
    },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || "/";

  console.log("[SW] Notification click:", url);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url)) {
          client.focus();
          return;
        }
      }
      return self.clients.openWindow(url);
    })
  );
});