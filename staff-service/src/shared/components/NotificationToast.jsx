import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notification/NotificationService';

export function NotificationToast() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNewNotification = (event) => {
      const newNotification = {
        id: Date.now(),
        ...event.detail,
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    };

    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setTimeout(() => removeNotification(id), 300);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-4 transform transition-all duration-300 ${
            notification.read ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={() => markAsRead(notification.id)}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {notification.body}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}