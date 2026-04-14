import React, { useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../services/firebase/config';

export function FCMTest() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const getFCMToken = async () => {
    setLoading(true);
    setStatus('🔄 Получение токена...');
    
    try {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setStatus('❌ Нет разрешения на уведомления');
          return;
        }
      }
      
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker готов');
      
      const vapidKey = "BEbQ34U1nl7rl7cEcjBWQR2OzetJELFZepZZiNxMzvBa_huNsj7_8mTD3dyF4Qu0LIKIY6CHX57ZSc3YA_HDBX8";
      
      const fcmToken = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration
      });
      
      if (fcmToken) {
        setToken(fcmToken);
        setStatus('✅ Токен получен!');
        localStorage.setItem('staff_fcm_token', fcmToken);
        console.log('✅ FCM Token:', fcmToken);
      } else {
        setStatus('❌ Не удалось получить токен');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setStatus('❌ Ошибка: ' + error.message);
    }
    
    setLoading(false);
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setStatus('📋 Токен скопирован!');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      zIndex: 9999,
      border: '1px solid #ccc',
      minWidth: '250px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔔 Push Тестер</h4>
      
      <button 
        onClick={getFCMToken} 
        disabled={loading}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%',
          marginBottom: '10px'
        }}
      >
        {loading ? '⏳ Получение...' : '📱 Получить FCM Token'}
      </button>
      
      {token && (
        <button 
          onClick={copyToken}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          📋 Копировать токен
        </button>
      )}
      
      {status && (
        <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
          {status}
        </div>
      )}
      
      {token && (
        <div style={{ fontSize: '10px', marginTop: '10px', wordBreak: 'break-all', color: '#999' }}>
          Token: {token.substring(0, 40)}...
        </div>
      )}
    </div>
  );
}