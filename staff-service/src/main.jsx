// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './ThemeContext';
import './theme.css';

if ('serviceWorker' in navigator) {
  console.log('[push][staff] Registering service worker /firebase-messaging-sw.js');
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('[push][staff] Service worker registered', {
        scope: registration.scope,
        activeState: registration.active?.state,
      });
    })
    .catch((error) => {
      console.error('[push][staff] Service worker registration failed', error);
    });
} else {
  console.warn('[push][staff] Service workers are not supported in this browser');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
