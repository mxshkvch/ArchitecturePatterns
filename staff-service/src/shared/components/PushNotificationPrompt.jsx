import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notification/NotificationService';

export function PushNotificationPrompt() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported && Notification.permission === 'granted') {
      setIsSubscribed(true);
    } else if (supported && Notification.permission === 'default') {
      const timer = setTimeout(() => setShowPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const enableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setIsSubscribed(true);
      setShowPrompt(false);
    }
  };

  const later = () => {
    setShowPrompt(false);
    // Покажем снова через час
    setTimeout(() => setShowPrompt(true), 3600000);
  };

  if (!isSupported || isSubscribed || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Включите уведомления
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Получайте мгновенные уведомления о новых операциях клиентов
            </p>
            <div className="mt-3 flex space-x-3">
              <button
                onClick={enableNotifications}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Включить
              </button>
              <button
                onClick={later}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Позже
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}