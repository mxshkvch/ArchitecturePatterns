// shared/utils/userUtils.js

/**
 * Получение цвета статуса пользователя
 * @param {string} status - Статус пользователя
 * @returns {string} Цвет в формате hex
 */
export const getUserStatusColor = (status) => {
  const statusColors = {
    'ACTIVE': '#2ecc71',
    'INACTIVE': '#95a5a6',
    'BLOCKED': '#e74c3c',
    'PENDING': '#f39c12',
    'DELETED': '#95a5a6'
  };
  return statusColors[status] || '#95a5a6';
};

/**
 * Получение текста статуса пользователя
 * @param {string} status - Статус пользователя
 * @returns {string} Текст статуса на русском
 */
export const getUserStatusText = (status) => {
  const statusText = {
    'ACTIVE': 'Активен',
    'INACTIVE': 'Неактивен',
    'BLOCKED': 'Заблокирован',
    'PENDING': 'На рассмотрении',
    'DELETED': 'Удален'
  };
  return statusText[status] || status;
};

/**
 * Получение цвета роли пользователя
 * @param {string} role - Роль пользователя
 * @returns {string} Цвет в формате hex
 */
export const getUserRoleColor = (role) => {
  const roleColors = {
    'ADMIN': '#f59e0b',
    'EMPLOYEE': '#3b82f6',
    'CLIENT': '#10b981'
  };
  return roleColors[role] || '#95a5a6';
};



/**
 * Получение иконки роли пользователя
 * @param {string} role - Роль пользователя
 * @returns {string} Иконка эмодзи
 */
export const getRoleIcon = (role) => {
  const roleIcons = {
    'ADMIN': '👑',
    'EMPLOYEE': '👔',
    'CLIENT': '👤'
  };
  return roleIcons[role] || '👤';
};

/**
 * Форматирование полного имени пользователя
 * @param {Object} user - Объект пользователя
 * @returns {string} Полное имя
 */
export const formatFullName = (user) => {
  if (!user) return '—';
  const parts = [user.lastName, user.firstName];
  if (user.middleName) {
    parts.push(user.middleName);
  }
  return parts.filter(Boolean).join(' ');
};

/**
 * Форматирование инициалов пользователя
 * @param {string} firstName - Имя
 * @param {string} lastName - Фамилия
 * @returns {string} Инициалы
 */
export const formatInitials = (firstName, lastName) => {
  const firstInitial = firstName?.charAt(0) || '';
  const lastInitial = lastName?.charAt(0) || '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

/**
 * Валидация email
 * @param {string} email - Email для проверки
 * @returns {boolean} Валиден ли email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Валидация телефона
 * @param {string} phone - Телефон для проверки
 * @returns {boolean} Валиден ли телефон
 */
export const isValidPhone = (phone) => {
  if (!phone) return true;
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanedPhone);
};

/**
 * Получение возраста пользователя по дате рождения
 * @param {string} birthDate - Дата рождения
 * @returns {number|null} Возраст
 */
export const getAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Фильтрация пользователей по поисковому запросу
 * @param {Array} users - Массив пользователей
 * @param {string} searchQuery - Поисковый запрос
 * @returns {Array} Отфильтрованный массив
 */
export const filterUsersBySearch = (users, searchQuery) => {
  if (!searchQuery) return users;
  
  const query = searchQuery.toLowerCase();
  return users.filter(user => {
    return (
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.includes(query)
    );
  });
};

/**
 * Сортировка пользователей
 * @param {Array} users - Массив пользователей
 * @param {string} sortBy - Поле для сортировки
 * @param {string} order - Порядок сортировки ('asc' или 'desc')
 * @returns {Array} Отсортированный массив
 */
export const sortUsers = (users, sortBy = 'createdAt', order = 'desc') => {
  const sorted = [...users];
  
  sorted.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'createdAt') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
  
  return sorted;
};

/**
 * Группировка пользователей по ролям
 * @param {Array} users - Массив пользователей
 * @returns {Object} Объект с группами
 */
export const groupUsersByRole = (users) => {
  return users.reduce((groups, user) => {
    const role = user.role || 'CLIENT';
    if (!groups[role]) {
      groups[role] = [];
    }
    groups[role].push(user);
    return groups;
  }, {});
};

/**
 * Статистика пользователей
 * @param {Array} users - Массив пользователей
 * @returns {Object} Статистика
 */
export const getUserStats = (users) => {
  const stats = {
    total: users.length,
    active: 0,
    inactive: 0,
    blocked: 0,
    admins: 0,
    employees: 0,
    clients: 0
  };
  
  users.forEach(user => {
    if (user.status === 'ACTIVE') stats.active++;
    if (user.status === 'INACTIVE') stats.inactive++;
    if (user.status === 'BLOCKED') stats.blocked++;
    if (user.role === 'ADMIN') stats.admins++;
    if (user.role === 'EMPLOYEE') stats.employees++;
    if (user.role === 'CLIENT') stats.clients++;
  });
  
  return stats;
};