// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeDI } from './core/di/container';

console.log('🚀 APP STARTING - Calling initializeDI()');
initializeDI();
console.log('✅ initializeDI() completed');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);