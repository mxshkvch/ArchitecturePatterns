import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './ThemeContext';
import { Layout } from './features/layout/components/Layout';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { LoadingScreen } from './shared/ui/LoadingScreen';
import { NotFound } from './shared/ui/NotFound';

import Login from './features/auth/pages/Login';
import { UserList } from './features/users/list/UserList';
import { CreditsList } from './features/credits/list/CreditsList';
import { MasterAccount } from './features/accounts/pages/MasterAccount';
import { UserAccounts } from './features/accounts/list/UserAccounts';
import { AccountTransactions } from './features/transactions/pages/AccountTransactions';
import { SettingsPage } from './features/settings/pages/SettingsPage';

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

const FirebaseMessagingInitializer = () => {
  useFirebaseMessaging();
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
            <FirebaseMessagingInitializer />
            
            <Routes>
              {/* Корневой путь - обрабатывает токен из URL */}
              <Route path="/" element={<Login />} />
              
              {/* Страница логина - тоже обрабатывает токен */}
              <Route path="/login" element={<Login />} />
              
              {/* Защищенные маршруты */}
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
          
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
