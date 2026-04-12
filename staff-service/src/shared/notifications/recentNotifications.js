import { normalizeMessagingPayload } from '../firebase/notificationPayload';

const STORAGE_KEY = 'staff_recent_notifications';
const MAX_NOTIFICATIONS = 20;
const listeners = new Set();
let notificationsCache = null;

const loadNotifications = () => {
  if (notificationsCache) {
    return notificationsCache;
  }

  if (typeof window === 'undefined') {
    notificationsCache = [];
    return notificationsCache;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      notificationsCache = [];
      return notificationsCache;
    }

    const parsed = JSON.parse(raw);
    notificationsCache = Array.isArray(parsed) ? parsed : [];
    return notificationsCache;
  } catch {
    notificationsCache = [];
    return notificationsCache;
  }
};

const persistNotifications = (notifications) => {
  notificationsCache = notifications;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }
};

const emitChange = () => {
  const snapshot = [...loadNotifications()];
  listeners.forEach((listener) => listener(snapshot));
};

const toNotificationItem = (payload) => {
  const normalized = normalizeMessagingPayload(payload);
  const data = normalized.options?.data || {};
  const now = new Date().toISOString();
  const fallbackId = now + '-' + Math.random().toString(36).slice(2, 10);

  return {
    id: data.messageId || fallbackId,
    title: normalized.title,
    body: normalized.options?.body || '',
    tag: normalized.options?.tag || '',
    link: data.link || '/',
    receivedAt: now,
  };
};

export const getRecentNotifications = () => [...loadNotifications()];

export const appendRecentNotification = (payload) => {
  const newItem = toNotificationItem(payload);
  const updated = [newItem, ...loadNotifications()].slice(0, MAX_NOTIFICATIONS);
  persistNotifications(updated);
  emitChange();
  return newItem;
};

export const subscribeRecentNotifications = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
