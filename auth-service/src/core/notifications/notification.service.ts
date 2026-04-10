// src/core/notifications/notification.service.ts
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationObserver {
  onNotification(notification: Notification): void;
}

export class NotificationService {
  private static instance: NotificationService;
  private observers: NotificationObserver[] = [];
  private notifications: Notification[] = [];

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  subscribe(observer: NotificationObserver): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: NotificationObserver): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  private notify(notification: Notification): void {
    this.notifications.push(notification);
    this.observers.forEach(observer => observer.onNotification(notification));
    
    if (notification.duration !== 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration || 5000);
    }
  }

  private removeNotification(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  success(message: string, duration?: number): void {
    this.notify({
      id: Date.now().toString(),
      type: 'success',
      message,
      duration,
    });
  }

  error(message: string, duration?: number): void {
    this.notify({
      id: Date.now().toString(),
      type: 'error',
      message,
      duration,
    });
  }

  warning(message: string, duration?: number): void {
    this.notify({
      id: Date.now().toString(),
      type: 'warning',
      message,
      duration,
    });
  }

  info(message: string, duration?: number): void {
    this.notify({
      id: Date.now().toString(),
      type: 'info',
      message,
      duration,
    });
  }

  clear(): void {
    this.notifications = [];
  }
}