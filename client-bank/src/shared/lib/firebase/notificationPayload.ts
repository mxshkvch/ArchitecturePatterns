export interface PushPayloadLike {
  messageId?: string;
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    image?: string;
  };
  data?: Record<string, string | undefined>;
  fcmOptions?: {
    link?: string;
  };
}

export interface NormalizedPushNotification {
  title: string;
  body: string;
  tag: string;
  messageId: string | null;
  url: string;
  data: Record<string, string>;
  icon: string;
  image?: string;
}

export interface NotificationCenterItem {
  id: string;
  title: string;
  body: string;
  time: string;
  link: string;
  read: boolean;
}

const DEFAULT_TITLE = "Банковское уведомление";
const DEFAULT_BODY = "У вас новое событие в приложении банка.";
const DEFAULT_ICON = "/vite.svg";

const toStringMap = (data?: Record<string, string | undefined>): Record<string, string> => {
  if (!data) {
    return {};
  }

  return Object.entries(data).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      acc[key] = value;
    }

    return acc;
  }, {});
};

const formatFallbackBody = (data: Record<string, string>): string => {
  const operationType = data.operationType;
  const amount = data.amount;
  const currency = data.currency;
  const status = data.status;

  const parts = [
    operationType ? `Операция: ${operationType}` : "",
    amount ? `Сумма: ${amount}${currency ? ` ${currency}` : ""}` : "",
    status ? `Статус: ${status}` : "",
  ].filter(Boolean);

  return parts.join(". ") || DEFAULT_BODY;
};

const formatFallbackTitle = (data: Record<string, string>): string => {
  if (data.title) {
    return data.title;
  }

  if (data.operationType) {
    return `Операция: ${data.operationType}`;
  }

  return DEFAULT_TITLE;
};

export const normalizePushNotification = (payload: PushPayloadLike): NormalizedPushNotification => {
  const data = toStringMap(payload.data);

  const title = payload.notification?.title || formatFallbackTitle(data);
  const body = payload.notification?.body || data.body || formatFallbackBody(data);
  const messageId = payload.messageId ?? data.messageId ?? data.googleMessageId ?? null;
  const tag =
    data.tag ||
    data.operationId ||
    data.transactionId ||
    messageId ||
    (data.operationType ? `operation-${data.operationType}` : "client-bank");

  const url = data.url || data.link || payload.fcmOptions?.link || "/";

  return {
    title,
    body,
    tag,
    messageId,
    url,
    data,
    icon: payload.notification?.icon || data.icon || DEFAULT_ICON,
    image: payload.notification?.image || data.image,
  };
};

export const buildNotificationOptions = (
  notification: NormalizedPushNotification,
): NotificationOptions => ({
  body: notification.body,
  icon: notification.icon,
  tag: notification.tag,
  data: {
    ...notification.data,
    url: notification.url,
    messageId: notification.messageId ?? "",
  },
});

export const resolveNotificationDeduplicationKey = (notification: NormalizedPushNotification): string =>
  notification.messageId || notification.tag;

export const createNotificationCenterItem = (
  notification: NormalizedPushNotification,
  timestamp: number = Date.now(),
): NotificationCenterItem => ({
  id: notification.messageId || `${notification.tag}-${timestamp}`,
  title: notification.title,
  body: notification.body,
  time: new Date(timestamp).toISOString(),
  link: notification.url,
  read: false,
});
