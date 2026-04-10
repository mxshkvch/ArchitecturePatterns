import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../../services/api/user/userService';

export const useUsersQuery = (page = 0, size = 5, role = '') => {
  const apiPage = page + 1;
  
  console.log('🔍 [useUsersQuery] Query params:', { page: apiPage, size, role });
  
  return useQuery({
    queryKey: ['users', apiPage, size, role],
    queryFn: async () => {
      console.log('🚀 [useUsersQuery] Fetching users from API...');
      const result = await userService.getUsers(apiPage, size, role || undefined);
      console.log('✅ [useUsersQuery] Fetch result:', result);
      return result;
    },
    staleTime: 30000,
    keepPreviousData: true,
    retry: 1,
    onError: (error) => {
      console.error('❌ [useUsersQuery] Error:', error);
    }
  });
};

// Хук для создания пользователя - переименован в useCreateUserMutation
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
    }
  });
};

export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }) => userService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Error updating user status:', error);
    }
  });
};

export const useUserById = (userId) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
    staleTime: 30000,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }) => userService.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
    }
  });
};