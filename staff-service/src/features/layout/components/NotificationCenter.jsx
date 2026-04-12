import React from 'react';
import { useRecentNotifications } from '../../../shared/hooks/useRecentNotifications';

const formatTime = (isoValue) => {
  try {
    return new Date(isoValue).toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return '';
  }
};

export const NotificationCenter = ({ onNavigate }) => {
  const notifications = useRecentNotifications();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    if (notification.link) {
      onNavigate(notification.link);
    }
  };

  return (
    <div ref={containerRef} style={styles.container}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={styles.bellButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        🔔
        {notifications.length > 0 && <span style={styles.badge}>{notifications.length > 99 ? '99+' : notifications.length}</span>}
      </button>

      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>Уведомления</div>
          {notifications.length === 0 ? (
            <div style={styles.emptyState}>Нет новых уведомлений</div>
          ) : (
            <ul style={styles.list}>
              {notifications.map((notification) => (
                <li key={notification.id} style={styles.listItem}>
                  <button type="button" onClick={() => handleNotificationClick(notification)} style={styles.notificationButton}>
                    <div style={styles.notificationTitle}>{notification.title}</div>
                    <div style={styles.notificationBody}>{notification.body}</div>
                    <div style={styles.notificationTime}>{formatTime(notification.receivedAt)}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
  },
  bellButton: {
    position: 'relative',
    minWidth: '42px',
    height: '42px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'background-color 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '999px',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    lineHeight: '20px',
  },
  panel: {
    position: 'absolute',
    top: '50px',
    right: 0,
    width: '360px',
    maxHeight: '420px',
    overflowY: 'auto',
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow)',
    zIndex: 1100,
  },
  panelHeader: {
    padding: '12px 14px',
    fontWeight: '600',
    borderBottom: '1px solid var(--border-color)',
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  listItem: {
    borderBottom: '1px solid var(--border-color)',
  },
  notificationButton: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    color: 'var(--text-color)',
  },
  notificationTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  notificationBody: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    wordBreak: 'break-word',
  },
  notificationTime: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  emptyState: {
    padding: '14px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
};
