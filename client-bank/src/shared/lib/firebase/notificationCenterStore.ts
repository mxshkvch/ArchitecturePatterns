import { useSyncExternalStore } from "react";
import type { NotificationCenterItem } from "./notificationPayload";

const NOTIFICATION_CENTER_STORAGE_KEY = "client_notifications";
const NOTIFICATION_CENTER_EVENT = "client-notifications-updated";
const MAX_NOTIFICATIONS = 20;

const sortByTimeDesc = (items: NotificationCenterItem[]): NotificationCenterItem[] =>
  [...items].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

const safeParse = (raw: string | null): NotificationCenterItem[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is NotificationCenterItem =>
        Boolean(
          item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.body === "string" &&
            typeof item.time === "string" &&
            typeof item.link === "string" &&
            typeof item.read === "boolean",
        ),
    );
  } catch {
    return [];
  }
};

const notifyStoreChanged = (): void => {
  window.dispatchEvent(new Event(NOTIFICATION_CENTER_EVENT));
};

const readNotifications = (): NotificationCenterItem[] =>
  sortByTimeDesc(safeParse(localStorage.getItem(NOTIFICATION_CENTER_STORAGE_KEY)));

const writeNotifications = (items: NotificationCenterItem[]): void => {
  const nextItems = sortByTimeDesc(items).slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(NOTIFICATION_CENTER_STORAGE_KEY, JSON.stringify(nextItems));
  notifyStoreChanged();
};

export const getNotificationCenterItems = (): NotificationCenterItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  return readNotifications();
};

export const addNotificationCenterItem = (item: NotificationCenterItem): void => {
  if (typeof window === "undefined") {
    return;
  }

  const existingItems = readNotifications();
  const withoutDuplicate = existingItems.filter((existingItem) => existingItem.id !== item.id);
  writeNotifications([item, ...withoutDuplicate]);
};

export const markNotificationCenterItemRead = (id: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const existingItems = readNotifications();
  const nextItems = existingItems.map((item) => (item.id === id ? { ...item, read: true } : item));
  writeNotifications(nextItems);
};

export const markAllNotificationCenterItemsRead = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const existingItems = readNotifications();
  const nextItems = existingItems.map((item) => ({ ...item, read: true }));
  writeNotifications(nextItems);
};

const subscribe = (onStoreChange: () => void): (() => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = (): void => {
    onStoreChange();
  };

  window.addEventListener(NOTIFICATION_CENTER_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(NOTIFICATION_CENTER_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
};

export const useNotificationCenterItems = (): NotificationCenterItem[] =>
  useSyncExternalStore(subscribe, getNotificationCenterItems, () => []);
