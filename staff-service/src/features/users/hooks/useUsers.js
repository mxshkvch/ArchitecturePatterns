import { useState, useEffect, useCallback } from 'react';
import { userService } from '../../../services/api';

export const useUserList = (initialSize = 5) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); 
  const [selectedRole, setSelectedRole] = useState('');
  const [size] = useState(initialSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const loadUsers = useCallback(async (currentPage = 0, role = selectedRole) => {
    try {
      setIsFetching(true);
      setLoading(true);
      
      const apiPage = currentPage;
      
      console.log('📡 [useUserList] Loading users:', { 
        uiPage: currentPage, 
        apiPage, 
        size, 
        role: role || 'all' 
      });
      
      const data = await userService.getUsers(apiPage, size, role || undefined);
      
      console.log('📥 [useUserList] Data received:', {
        contentLength: data.content?.length,
        totalElements: data.page?.totalElements,
        apiPageFromResponse: data.page?.page,
        totalPagesFromResponse: data.page?.totalPages
      });
      
      setUsers(data.content || []);
      setTotalElements(data.page?.totalElements || 0);
      setTotalPages(data.page?.totalPages || 0);
      setError(null);
    } catch (err) {
      console.error('❌ [useUserList] Error loading users:', err);
      setError(err.response?.data?.message || 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [size, selectedRole]);

  useEffect(() => {
    console.log('🔄 [useUserList] Role changed, resetting to page 0');
    setPage(0);
    loadUsers(0, selectedRole);
  }, [selectedRole, loadUsers]);

  useEffect(() => {
    loadUsers(0, selectedRole);
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const handlePageChange = (newPage) => {
    console.log('📄 [useUserList] Page change from', page, 'to', newPage);
    setPage(newPage);
    loadUsers(newPage, selectedRole);
  };

  const handleCreateUser = async (userData) => {
    try {
      const newUser = await userService.createUser(userData);
      alert(`Пользователь ${newUser.firstName} ${newUser.lastName} успешно создан!`);
      setPage(0);
      await loadUsers(0, selectedRole);
      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.message || 'Не удалось создать пользователя');
      throw error;
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await userService.updateUserStatus(userId, newStatus);
      await loadUsers(page, selectedRole);
      return { success: true };
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Не удалось изменить статус пользователя');
      throw error;
    }
  };

  const refetch = () => {
    loadUsers(page, selectedRole);
  };

  return {
    users,
    loading,
    isFetching,
    error,
    pageInfo: {
      page: page,                  
      size: size,
      totalElements: totalElements,
      totalPages: totalPages
    },
    selectedRole,
    handleRoleChange,
    handlePageChange,
    handleCreateUser,
    handleUpdateStatus,
    refetch,
  };
};