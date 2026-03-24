import React from 'react';

export const Spinner = ({ size = 40, color = '#667eea', text = null }) => {
  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.spinner,
          width: size,
          height: size,
          borderWidth: size / 10,
          borderTopColor: color
        }}
      />
      {text && <p style={styles.text}>{text}</p>}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px'
  },
  spinner: {
    border: 'solid #f3f3f3',
    borderTop: 'solid',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  text: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  }
};

// Добавляем анимацию глобально
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);