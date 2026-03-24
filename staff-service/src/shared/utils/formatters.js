// shared/utils/formatters.js
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount, currency = 'RUB') => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '0.00 ₽';
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency || 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
};

export const getStatusColor = (status) => {
  const statusColors = {
    'ACTIVE': '#2ecc71',
    'INACTIVE': '#95a5a6',
    'BLOCKED': '#e74c3c',
    'CLOSED': '#95a5a6',
    'PENDING': '#f39c12',
    'APPROVED': '#2ecc71',
    'REJECTED': '#e74c3c'
  };
  return statusColors[status] || '#95a5a6';
};

export const getStatusText = (status) => {
  const statusText = {
    'ACTIVE': 'Активен',
    'INACTIVE': 'Неактивен',
    'BLOCKED': 'Заблокирован',
    'CLOSED': 'Закрыт',
    'PENDING': 'На рассмотрении',
    'APPROVED': 'Одобрен',
    'REJECTED': 'Отклонен'
  };
  return statusText[status] || status;
};

export const getRoleLabel = (role) => {
  const roleLabels = {
    'CLIENT': 'Клиент',
    'EMPLOYEE': 'Сотрудник',
    'ADMIN': 'Администратор'
  };
  return roleLabels[role] || role;
};