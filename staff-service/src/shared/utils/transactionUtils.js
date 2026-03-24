// shared/utils/transactionUtils.js
export const getTransactionTypeLabel = (type) => {
  const typeLabels = {
    'DEPOSIT': 'Пополнение',
    'WITHDRAWAL': 'Снятие',
    'TRANSFER': 'Перевод',
    'PAYMENT': 'Оплата',
    'REFUND': 'Возврат',
    'FEE': 'Комиссия',
    'INTEREST': 'Проценты',
    'CREDIT_PAYMENT': 'Платеж по кредиту',
  };
  return typeLabels[type] || type;
};

export const getTransactionTypeColor = (type) => {
  const typeColors = {
    'DEPOSIT': '#2ecc71',
    'WITHDRAWAL': '#e74c3c',
    'TRANSFER': '#3498db',
    'PAYMENT': '#e67e22',
    'REFUND': '#2ecc71',
    'FEE': '#95a5a6',
    'INTEREST': '#f39c12',
    'CREDIT_PAYMENT': '#9b59b6'
  };
  return typeColors[type] || '#95a5a6';
};

export const getTransactionIcon = (type) => {
  const icons = {
    'DEPOSIT': '💰',
    'WITHDRAWAL': '💸',
    'TRANSFER': '🔄',
    'PAYMENT': '💳',
    'REFUND': '↩️',
    'FEE': '⚙️',
    'INTEREST': '📈',
    'CREDIT_PAYMENT': '🏦'
  };
  return icons[type] || '💵';
};

export const getTransactionAmountColor = (type) => {
  const positiveTypes = ['DEPOSIT', 'REFUND', 'INTEREST'];
  return positiveTypes.includes(type) ? '#2ecc71' : '#e74c3c';
};

export const formatTransactionId = (id, length = 8) => {
  if (!id) return '—';
  return `${id.slice(0, length)}...`;
};