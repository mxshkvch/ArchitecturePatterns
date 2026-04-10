import { useMemo } from 'react';
import { useCurrentUser } from '../../../shared/hooks/useCurrentUser';

export const useUserPermissions = (targetUser) => {
  const { currentUser, isNewEmployee: isCurrentUserNewEmployee } = useCurrentUser();
  
  const isTargetNewEmployeeOrAdmin = useMemo(() => {
    const isEmployeeOrAdmin = targetUser?.role === 'EMPLOYEE' || targetUser?.role === 'ADMIN';
    if (!isEmployeeOrAdmin) return false;
    
    const accountCreationDate = new Date(targetUser.createdAt);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    return (now - accountCreationDate) < oneDayInMs;
  }, [targetUser]);
  
  const canShowActionButtons = useMemo(() => {
    if (isCurrentUserNewEmployee) return false;
    
    return targetUser?.role === 'CLIENT' || isTargetNewEmployeeOrAdmin;
  }, [targetUser, isCurrentUserNewEmployee, isTargetNewEmployeeOrAdmin]);
  
  const canChangeStatus = useMemo(() => {
    if (isTargetNewEmployeeOrAdmin) return false;
    
    if (currentUser?.id === targetUser?.id) return false;
    
    return true;
  }, [targetUser, currentUser, isTargetNewEmployeeOrAdmin]);
  
  return {
    canShowActionButtons,
    canChangeStatus,
    isTargetNewEmployeeOrAdmin,
  };
};