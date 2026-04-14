// src/features/layout/components/Layout.jsx
import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { NotificationToast } from '../../../shared/components/NotificationToast';
import { PushNotificationPrompt } from '../../../shared/components/PushNotificationPrompt';
import { notificationService } from '../../../services/notification/NotificationService'

export const Layout = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const initNotifications = async () => {
      const userRole = localStorage.getItem('user_role');
      const isStaff = userRole === 'staff' || userRole === 'EMPLOYEE'; 
      
      if (isStaff && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          console.log('📱 Initializing push notifications for staff');
          await notificationService.getFCMToken();
          
          notificationService.onMessage((notification) => {
            console.log('📨 New notification received:', notification);
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio not supported:', e));
          });
          
          setNotificationsEnabled(true);
        } else if (Notification.permission === 'default') {
          // Разрешение еще не запрошено, показываем промпт позже
          console.log('🔔 Notifications not yet requested');
        }
      }
    };
    
    initNotifications();
    
    // Очистка при размонтировании
    return () => {
      if (notificationsEnabled) {
        notificationService.unsubscribe();
      }
    };
  }, []);

  return (
    <div style={styles.layout}>
      <Header />
      <main style={styles.main}>
        {children}
      </main>
      
      {/* Компоненты уведомлений */}
      <NotificationToast />
      <PushNotificationPrompt />
    </div>
  );
};

const styles = {
  layout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-primary)',
    transition: 'background-color 0.3s ease',
    position: 'relative'
  },
  main: {
    flex: 1,
    padding: '20px'
  }
};