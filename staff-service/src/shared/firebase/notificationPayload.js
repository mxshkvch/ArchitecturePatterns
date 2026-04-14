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

const toFormattedAmount = (amount, currency = 'RUB') => {
  if (amount === undefined || amount === null || amount === '') {
    return '';
  }

  const numericAmount = Number(amount);
  if (!Number.isNaN(numericAmount)) {
    try {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(numericAmount);
    } catch {
      return numericAmount + ' ' + currency;
    }
  }

  return String(amount);
};

const toBodyFromData = (data) => {
  if (data.body) {
    return data.body;
  }

  const details = [];
  const operationTitle = toOperationTitle(data.operationType);
  const formattedAmount = toFormattedAmount(data.amount, data.currency || 'RUB');

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

export const normalizeMessagingPayload = (payload) => {
  const notification = payload?.notification || {};
  const data = payload?.data || {};
  const messageId = payload?.messageId || data.messageId || data.id || '';

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
      ...data,
      link,
      messageId,
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
