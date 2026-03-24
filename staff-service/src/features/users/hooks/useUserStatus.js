import { useState } from 'react';
import { updateUserStatus } from '../../../services/api';

export const useUserStatus = (userId, currentStatus, onStatusChange) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const updateStatus = async (newStatus) => {
    try {
      setIsUpdating(true);
      await updateUserStatus(userId, newStatus);
      onStatusChange(userId, newStatus);
      setShowConfirm(false);
      return { success: true };
    } catch (error) {
      alert('Не удалось изменить статус пользователя');
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleStatusToggle = () => {
    if (currentStatus === 'BLOCKED') {
      updateStatus('ACTIVE');
    } else {
      setShowConfirm(true);
    }
  };
  
  const handleConfirmBlock = () => {
    updateStatus('BLOCKED');
  };
  
  const handleCancelBlock = () => {
    setShowConfirm(false);
  };
  
  const closeConfirm = () => {
    setShowConfirm(false);
  };
  
  const isBlocked = currentStatus === 'BLOCKED';
  const isActive = currentStatus === 'ACTIVE';
  
  return {
    isUpdating,
    showConfirm,
    isBlocked,
    isActive,
    handleStatusToggle,
    handleConfirmBlock,
    handleCancelBlock,
    closeConfirm,
    updateStatus,
  };
};