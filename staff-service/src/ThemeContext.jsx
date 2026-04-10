// ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getSettings, updateSettings } from './services/api/index';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applicationType, setApplicationType] = useState('EMPLOYEE');

  // Загрузка настроек с сервера
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await getSettings(applicationType);
        if (settings && settings.theme) {
          const isDark = settings.theme === 'DARK';
          setIsDarkMode(isDark);
          applyTheme(isDark);
        }
      } catch (error) {
        console.error('Failed to load theme settings:', error);
        // Если не удалось загрузить, пробуем загрузить из localStorage как fallback
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          const isDark = savedTheme === 'dark';
          setIsDarkMode(isDark);
          applyTheme(isDark);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [applicationType]);

  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const toggleTheme = async () => {
    const newIsDarkMode = !isDarkMode;
    const newTheme = newIsDarkMode ? 'DARK' : 'LIGHT';
    
    // Сначала обновляем UI для мгновенной обратной связи
    setIsDarkMode(newIsDarkMode);
    applyTheme(newIsDarkMode);
    
    // Сохраняем в localStorage как fallback
    localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
    
    // Отправляем на сервер
    try {
      await updateSettings({
        applicationType: applicationType,
        theme: newTheme,
        hiddenAccountIds: [] // Сохраняем текущие скрытые аккаунты, если есть
      });
      console.log('Theme saved to server:', newTheme);
    } catch (error) {
      console.error('Failed to save theme to server:', error);
      // Если не удалось сохранить на сервере, откатываем изменение
      setIsDarkMode(isDarkMode);
      applyTheme(isDarkMode);
      alert('Не удалось сохранить настройки темы на сервере');
    }
  };

  const updateApplicationType = (type) => {
    setApplicationType(type);
  };

  const value = {
    isDarkMode,
    loading,
    toggleTheme,
    applicationType,
    updateApplicationType
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};