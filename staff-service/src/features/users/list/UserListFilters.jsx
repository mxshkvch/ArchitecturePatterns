// features/users/list/UserListFilters.jsx
import React from 'react';
import { RoleFilter } from '../ui/RoleFilter';

export const UserListFilters = ({ selectedRole, onRoleChange, getRoleLabel }) => {
  return (
    <RoleFilter 
      selectedRole={selectedRole}
      onRoleChange={onRoleChange}
      getRoleLabel={getRoleLabel}
    />
  );
};