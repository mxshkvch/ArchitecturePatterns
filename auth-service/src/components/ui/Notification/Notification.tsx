// src/components/ui/Notification/Notification.tsx
import  { useState, useEffect } from 'react';
import * as React from 'react';

import { NotificationService } from '../../../core/notifications/notification.service';
import type { Notification as INotification } from '../../../core/notifications/notification.service';
import './Notification.css';

export const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    const observer = {
      onNotification: (notification: INotification) => {
        setNotifications(prev => [...prev, notification]);
        
        if (notification.duration !== 0) {
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }, notification.duration || 5000);
        }
      },
    };

    notificationService.subscribe(observer);
    return () => notificationService.unsubscribe(observer);
  }, [notificationService]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            {notification.action && (
              <button
                className="notification-action"
                onClick={notification.action.onClick}
              >
                {notification.action.label}
              </button>
            )}
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};