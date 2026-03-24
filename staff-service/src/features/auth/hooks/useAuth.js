import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, tokenManager, isAuthenticated } from '../../../services/api';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    hasToken: false,
    tokenFromUrl: null,
    role: null
  });

  const redirectToAuthService = useCallback(() => {
    console.log('🔄 Redirecting to auth service login...');
    const authServiceUrl = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:5175/login';
    window.location.href = authServiceUrl;
  }, []);

  const redirectToApp = useCallback(() => {
    console.log('✅ Authentication successful, redirecting to app...');
    setTimeout(() => {
      window.location.href = '/users';
    }, 1000);
  }, []);

  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Получаем токен из URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      const roleFromUrl = urlParams.get('role');

      console.log('🔍 URL parameters:', {
        hasToken: !!tokenFromUrl,
        role: roleFromUrl,
        tokenPreview: tokenFromUrl ? `${tokenFromUrl.substring(0, 50)}...` : null
      });

      // Инициализируем аутентификацию
      const hasToken = authService.initialize();
      
      // Проверяем статус
      const authenticated = isAuthenticated();
      const storedRole = tokenManager.getRole();

      setAuthStatus({
        isAuthenticated: authenticated,
        hasToken: hasToken || !!tokenFromUrl,
        tokenFromUrl: tokenFromUrl,
        role: storedRole || roleFromUrl
      });

      // Принимаем решение о редиректе
      if (authenticated) {
        console.log('✅ User is authenticated');
        redirectToApp();
      } else if (hasToken || tokenFromUrl) {
        console.log('⚠️ Token found but authentication validation failed');
        // В случае ошибки валидации, но наличия токена, все равно пробуем зайти
        redirectToApp();
      } else {
        console.log('❌ No valid authentication token found');
        setError('Не удалось найти токен аутентификации. Пожалуйста, войдите в систему.');
        redirectToAuthService();
      }

    } catch (err) {
      console.error('❌ Authentication initialization error:', err);
      setError('Ошибка при проверке аутентификации');
      redirectToAuthService();
    } finally {
      setLoading(false);
    }
  }, [redirectToApp, redirectToAuthService]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    loading,
    error,
    authStatus,
    retry: initialize
  };
};