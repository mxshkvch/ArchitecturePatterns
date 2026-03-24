import React from 'react';

export const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  isConfirming = false,
  confirmButtonColor = '#ef4444'
}) => {
  if (!isOpen) return null;
  
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h4 style={styles.title}>{title}</h4>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttons}>
          <button 
            onClick={onCancel}
            style={styles.cancelButton}
            disabled={isConfirming}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            style={{
              ...styles.confirmButton,
              backgroundColor: confirmButtonColor,
              opacity: isConfirming ? 0.5 : 1
            }}
            disabled={isConfirming}
          >
            {isConfirming ? 'Обработка...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  dialog: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  },
  title: {
    margin: '0 0 15px 0',
    color: '#1e293b',
    fontSize: '1.3em',
    fontWeight: '600'
  },
  message: {
    margin: '0 0 20px 0',
    color: '#64748b',
    fontSize: '1em',
    lineHeight: '1.5'
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#94a3b8'
    }
  },
  confirmButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s',
    ':hover': {
      filter: 'brightness(0.9)'
    }
  }
};