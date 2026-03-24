// shared/utils/creditUtils.js
export const getCreditStatusColor = (status) => {
  const statusColors = {
    'ACTIVE': '#2ecc71',
    'PAID': '#3498db',
    'OVERDUE': '#e74c3c',
    'CLOSED': '#95a5a6',
    'PENDING': '#f39c12',
    'APPROVED': '#2ecc71',
    'REJECTED': '#e74c3c'
  };
  return statusColors[status] || '#95a5a6';
};

export const getCreditStatusLabel = (status) => {
  const statusLabels = {
    'ACTIVE': 'Активный',
    'PAID': 'Оплачен',
    'OVERDUE': 'Просрочен',
    'CLOSED': 'Закрыт',
    'PENDING': 'На рассмотрении',
    'APPROVED': 'Одобрен',
    'REJECTED': 'Отклонен'
  };
  return statusLabels[status] || status;
};

export const getCreditStatusIcon = (status) => {
  const statusIcons = {
    'ACTIVE': '✅',
    'PAID': '💰',
    'OVERDUE': '⚠️',
    'CLOSED': '🔒',
    'PENDING': '⏳',
    'APPROVED': '✔️',
    'REJECTED': '❌'
  };
  return statusIcons[status] || '💳';
};

export const formatCreditId = (id, length = 8) => {
  if (!id) return '—';
  return `${id.slice(0, length)}...`;
};

export const calculateProgress = (principal, remainingAmount) => {
  if (!principal || principal <= 0) return 0;
  const paid = principal - remainingAmount;
  const progress = (paid / principal) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
};