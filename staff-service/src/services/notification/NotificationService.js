import { messaging, getToken, onMessage } from '../firebase/config';

class NotificationService {
  constructor() {
    this.token = null;
    this.messageHandlers = [];
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
  }

  

  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        await this.getFCMToken();
        return true;
      } else {
        console.warn('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  async getFCMToken() {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered');

      this.token = await getToken(messaging, {
        vapidKey: 'BEbQ34U1nl7rl7cEcjBWQR2OzetJELFZepZZiNxMzvBa_huNsj7_8mTD3dyF4Qu0LIKIY6CHX57ZSc3YA_HDBX8', 
        serviceWorkerRegistration: registration
      });

      if (this.token) {
        console.log('✅ FCM Token:', this.token);
        // Отправляем токен на сервер
        await this.sendTokenToServer(this.token);
        return this.token;
      } else {
        console.warn('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async sendTokenToServer(token) {
    try {
      // Отправляем токен на ваш бэкенд
      const response = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          token: token,
          platform: 'web',
          role: 'staff' // Для сотрудника
        })
      });

      if (response.ok) {
        console.log('✅ Token sent to server');
      }
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  // Слушаем входящие сообщения (когда приложение открыто)
  onMessage(callback) {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('📨 Received foreground message:', payload);
      
      const notification = {
        title: payload.notification?.title || 'Новая операция',
        body: payload.notification?.body || '',
        data: payload.data,
        timestamp: new Date().toISOString()
      };

      // Показываем уведомление в приложении
      this.showInAppNotification(notification);
      
      // Вызываем колбэк
      callback?.(notification);
    });
  }

  // Показываем уведомление внутри приложения
  showInAppNotification(notification) {
    // Создаем событие для React компонентов
    const event = new CustomEvent('new-notification', {
      detail: notification
    });
    window.dispatchEvent(event);
  }

  // Обновить токен (например, при смене пользователя)
  async refreshToken() {
    if (this.token) {
      await this.sendTokenToServer(this.token);
    }
  }

  // Отписаться от уведомлений
  async unsubscribe() {
    if (this.token) {
      try {
        await fetch('/api/notifications/unregister-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ token: this.token })
        });
        console.log('✅ Unsubscribed from notifications');
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }
  }
}

export const notificationService = new NotificationService();