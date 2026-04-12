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
  console.log("BG message:", payload);

  self.registration.showNotification(
    payload.notification?.title || "Уведомление",
    {
      body: payload.notification?.body,
      icon: "/vite.svg"
    }
  );
});
