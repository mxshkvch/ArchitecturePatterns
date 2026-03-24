import React from 'react';

export const UserAvatar = ({ firstName, lastName, size = 50, bgColor = '#3b82f6' }) => {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  
  return (
    <div style={{
      ...styles.avatar,
      width: size,
      height: size,
      backgroundColor: bgColor,
      fontSize: size * 0.4
    }}>
      {initials || '?'}
    </div>
  );
};

const styles = {
  avatar: {
    borderRadius: '12px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    flexShrink: 0
  }
};