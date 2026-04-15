import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './ThemeContext';
import { Layout } from './features/layout/components/Layout';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { LoadingScreen } from './shared/ui/LoadingScreen';
import { NotFound } from './shared/ui/NotFound';
import { CircuitBreakerIndicator } from './shared/hooks/useResilientQuery';
import Login from './features/auth/pages/Login';
import { UserList } from './features/users/list/UserList';
import { CreditsList } from './features/credits/list/CreditsList';
import { MasterAccount } from './features/accounts/pages/MasterAccount';
import { UserAccounts } from './features/accounts/list/UserAccounts';
import { AccountTransactions } from './features/transactions/pages/AccountTransactions';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { FCMTest } from './components/FCMTest';
import { messaging } from './services/firebase/config';
import { getToken, onMessage } from "firebase/messaging";
import { registerPushToken } from './services/api/pushNotifications'; // API коллеги

import { useGlobalWebSocket } from './shared/hooks/useWebSocket';
import { useFirebaseMessaging } from './shared/hooks/useFirebaseMessaging';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      cacheTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

const WithLayout = ({ children }) => {
  return <Layout>{children}</Layout>;
};

const ProtectedRouteWithLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <WithLayout>{children}</WithLayout>
    </ProtectedRoute>
  );
};

const WebSocketInitializer = () => {
  useGlobalWebSocket();
  return null;
};

const NotificationsInitializer = () => {
  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        const authToken = localStorage.getItem('access_token');
        const userRole = localStorage.getItem('user_role');
        const isStaff = userRole === 'staff' || userRole === 'EMPLOYEE';
        
        if (!authToken || !isStaff) {
          console.log('📱 Уведомления: только для авторизованных сотрудников');
          return;
        }
        
        console.log('📱 Инициализация push-уведомлений для сотрудника...');
        
        // Запрашиваем разрешение
        const permission = await Notification.requestPermission();
        console.log('[FCM] Permission:', permission);
        
        if (permission !== "granted") return;
        
        // Ждем Service Worker
        const registration = await navigator.serviceWorker.ready;
        console.log('[FCM] Service Worker ready');
        
        // Получаем FCM токен
        const token = await getToken(messaging, {
          vapidKey: "BEbQ34U1nl7rl7cEcjBWQR2OzetJELFZepZZiNxMzvBa_huNsj7_8mTD3dyF4Qu0LIKIY6CHX57ZSc3YA_HDBX8",
          serviceWorkerRegistration: registration,
        });
        
        if (token) {
          console.log('✅ FCM токен получен');
          
          // Отправляем токен на бэкенд через API коллеги
          await registerPushToken(token, "EMPLOYEE", authToken);
          
          // Сохраняем токен
          localStorage.setItem("staff_fcm_token", token);
          console.log('✅ Токен зарегистрирован для сотрудника');
          
          // Слушаем входящие уведомления (когда приложение открыто)
          onMessage(messaging, (payload) => {
            console.log('📨 Получено уведомление:', payload);
            
            if (Notification.permission === "granted") {
              new Notification(
                payload.notification?.title ?? "Новое уведомление",
                {
                  body: payload.notification?.body ?? "",
                  icon: "/favicon.ico",
                }
              );
            }
          });
        } else {
          console.warn('⚠️ Не удалось получить FCM токен');
        }
      } catch (error) {
        console.error('❌ Ошибка инициализации уведомлений:', error);
      }
    };
    
    initializePushNotifications();
  }, []);
  
  return null;
};

function App() {
  const [isAppLoading, setIsAppLoading] = React.useState(false);

  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('App initialized');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  if (isAppLoading) {
    return <LoadingScreen message="Загрузка приложения..." />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <WebSocketInitializer />
            <NotificationsInitializer />
            
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              
              <Route
                path="/users"
                element={
                  <ProtectedRouteWithLayout>
                    <UserList />
                  </ProtectedRouteWithLayout>
                }
              />
              
              <Route
                path="/users/:userId"
                element={
                  <ProtectedRouteWithLayout>
                    <UserAccounts />
                  </ProtectedRouteWithLayout>
                }
              />
              
              <Route
                path="/users/:userId/accounts/:accountId/transactions"
                element={
                  <ProtectedRouteWithLayout>
                    <AccountTransactions />
                  </ProtectedRouteWithLayout>
                }
              />
              
              <Route
                path="/credits"
                element={
                  <ProtectedRouteWithLayout>
                    <CreditsList />
                  </ProtectedRouteWithLayout>
                }
              />
              
              <Route
                path="/master-account"
                element={
                  <ProtectedRouteWithLayout>
                    <MasterAccount />
                  </ProtectedRouteWithLayout>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <ProtectedRouteWithLayout>
                    <SettingsPage />
                  </ProtectedRouteWithLayout>
                }
              />
              
              <Route
                path="*"
                element={
                  <WithLayout>
                    <NotFound />
                  </WithLayout>
                }
              />
            </Routes>
          </BrowserRouter>
          <CircuitBreakerIndicator serviceName="CreditService" />
          


          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
