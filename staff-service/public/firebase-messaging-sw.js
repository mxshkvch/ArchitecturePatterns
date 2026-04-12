/* global importScripts, firebase, clients */
importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAZmPJ36P4ZvhH5s24ygcqs-L3Y86MxGoU',
  authDomain: 'architecturepatterns-d92c3.firebaseapp.com',
  projectId: 'architecturepatterns-d92c3',
  storageBucket: 'architecturepatterns-d92c3.firebasestorage.app',
  messagingSenderId: '375783130162',
  appId: '1:375783130162:web:5b9125de68b864cd2ee82b',
});

const messaging = firebase.messaging();
console.log('[push-sw][staff] Firebase messaging service worker initialized');
const MESSAGE_DEDUPE_TTL_MS = 15000;
const recentMessages = new Map();

const DEFAULT_TITLE = 'Новое уведомление';
const DEFAULT_BODY = 'Проверьте последние обновления в приложении.';
const DEFAULT_ICON = '/vite.svg';

const OPERATION_TITLES = {
  DEPOSIT: 'Пополнение счёта',
  WITHDRAW: 'Списание со счёта',
  TRANSFER: 'Перевод средств',
  CREDIT_CREATED: 'Оформлен кредит',
  CREDIT_PAID: 'Платёж по кредиту',
  ACCOUNT_BLOCKED: 'Счёт заблокирован',
  ACCOUNT_UNBLOCKED: 'Счёт разблокирован',
};

const isDuplicateMessage = (messageKey) => {
  if (!messageKey) {
    return false;
  }

  const now = Date.now();

  for (const [key, timestamp] of recentMessages.entries()) {
    if (now - timestamp > MESSAGE_DEDUPE_TTL_MS) {
      recentMessages.delete(key);
    }
  }

  const previous = recentMessages.get(messageKey);
  if (previous && now - previous < MESSAGE_DEDUPE_TTL_MS) {
    return true;
  }

  recentMessages.set(messageKey, now);
  return false;
};

const toOperationTitle = (operationType) => {
  if (!operationType) {
    return '';
  }

  const normalized = String(operationType).trim().toUpperCase();
  if (OPERATION_TITLES[normalized]) {
    return OPERATION_TITLES[normalized];
  }

  return normalized
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const toFormattedAmount = (amount, currency) => {
  if (amount === undefined || amount === null || amount === '') {
    return '';
  }

  const numericAmount = Number(amount);
  if (!Number.isNaN(numericAmount)) {
    return numericAmount + ' ' + (currency || 'RUB');
  }

  return String(amount);
};

const toBodyFromData = (data) => {
  if (data.body) {
    return data.body;
  }

  const details = [];
  const operationTitle = toOperationTitle(data.operationType);
  const formattedAmount = toFormattedAmount(data.amount, data.currency);

  if (operationTitle) {
    details.push(operationTitle);
  }

  if (formattedAmount) {
    details.push('Сумма: ' + formattedAmount);
  }

  if (data.accountNumber) {
    details.push('Счёт: ' + data.accountNumber);
  }

  if (data.userId) {
    details.push('Пользователь: ' + data.userId);
  }

  return details.length ? details.join(' • ') : DEFAULT_BODY;
};

const toTag = (notification, data, messageId) => {
  if (notification.tag) {
    return notification.tag;
  }

  if (data.tag) {
    return data.tag;
  }

  if (messageId) {
    return 'fcm-' + messageId;
  }

  if (data.operationType || data.accountNumber || data.userId) {
    return ['staff', data.operationType, data.accountNumber, data.userId]
      .filter(Boolean)
      .join(':');
  }

  return 'staff-fcm';
};

const normalizePayload = (payload) => {
  const notification = payload && payload.notification ? payload.notification : {};
  const data = payload && payload.data ? payload.data : {};
  const messageId = (payload && payload.messageId) || data.messageId || data.id || '';

  const title = notification.title || data.title || toOperationTitle(data.operationType) || DEFAULT_TITLE;
  const body = notification.body || toBodyFromData(data);
  const link = data.link || data.url || data.click_action || notification.click_action || '/';
  const tag = toTag(notification, data, messageId);

  const options = {
    body,
    icon: notification.icon || data.icon || DEFAULT_ICON,
    badge: notification.badge || data.badge || DEFAULT_ICON,
    tag,
    renotify: false,
    data: {
      link,
      messageId,
      ...data,
    },
  };

  const image = notification.image || data.image;
  if (image) {
    options.image = image;
  }

  return {
    title,
    options,
    dedupeKey: messageId || tag + ':' + title + ':' + body,
  };
};

messaging.onBackgroundMessage((payload) => {
  console.log('[push-sw][staff] Background message received', {
    messageId: payload && payload.messageId ? payload.messageId : '',
    hasNotification: Boolean(payload && payload.notification),
    dataKeys: Object.keys((payload && payload.data) || {}),
  });

  const normalized = normalizePayload(payload);

  if (isDuplicateMessage(normalized.dedupeKey)) {
    console.log('[push-sw][staff] Background duplicate skipped', {
      dedupeKey: normalized.dedupeKey,
      tag: normalized.options && normalized.options.tag ? normalized.options.tag : '',
      messageId: normalized.options && normalized.options.data ? normalized.options.data.messageId : '',
    });
    return;
  }

  console.log('[push-sw][staff] Showing background notification', {
    title: normalized.title,
    tag: normalized.options && normalized.options.tag ? normalized.options.tag : '',
    targetUrl: normalized.options && normalized.options.data ? normalized.options.data.link : '/',
  });
  self.registration.showNotification(normalized.title, normalized.options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification && event.notification.data && event.notification.data.link) || '/';
  const absoluteTargetUrl = new URL(targetUrl, self.location.origin).href;
  console.log('[push-sw][staff] Notification click', {
    targetUrl: absoluteTargetUrl,
    messageId: event.notification && event.notification.data ? event.notification.data.messageId : '',
  });

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin)) {
          console.log('[push-sw][staff] Focusing existing client window', {
            clientUrl: client.url,
            targetUrl: absoluteTargetUrl,
          });
          return client.focus().then((focusedClient) => {
            if (focusedClient.url !== absoluteTargetUrl && typeof focusedClient.navigate === 'function') {
              console.log('[push-sw][staff] Navigating focused client to notification target', {
                from: focusedClient.url,
                to: absoluteTargetUrl,
              });
              return focusedClient.navigate(absoluteTargetUrl);
            }

            return focusedClient;
          });
        }
      }

      if (clients.openWindow) {
        console.log('[push-sw][staff] Opening new client window', { targetUrl: absoluteTargetUrl });
        return clients.openWindow(absoluteTargetUrl);
      }

      return undefined;
    })
  );
});
