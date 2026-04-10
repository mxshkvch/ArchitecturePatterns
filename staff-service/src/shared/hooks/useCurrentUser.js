import { useMemo } from 'react';

export const useCurrentUser = () => {
  const currentUser = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Ошибка при парсинге данных пользователя:', error);
      return null;
    }
  }, []);
  
  const isEmployeeOrAdmin = useMemo(() => {
    return currentUser?.role === 'EMPLOYEE' || currentUser?.role === 'ADMIN';
  }, [currentUser]);
  
  const isNewEmployee = useMemo(() => {
    if (!currentUser || !isEmployeeOrAdmin) return false;
    
    const accountCreationDate = new Date(currentUser.createdAt);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    return (now - accountCreationDate) < oneDayInMs;
  }, [currentUser, isEmployeeOrAdmin]);
  
  return {
    currentUser,
    isEmployeeOrAdmin,
    isNewEmployee,
  };
};