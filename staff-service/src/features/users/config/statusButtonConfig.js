export const getStatusButtonConfig = (isBlocked, isUpdating) => {
  if (isBlocked) {
    return {
      text: isUpdating ? '⏳' : '🔓',
      bgColor: '#10b981',
      title: 'Разблокировать пользователя',
      actionType: 'unblock'
    };
  }
  
  return {
    text: isUpdating ? '⏳' : '🔒',
    bgColor: '#ef4444',
    title: 'Заблокировать пользователя',
    actionType: 'block'
  };
};