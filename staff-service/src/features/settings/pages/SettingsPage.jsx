import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../../services/api';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { InfoBox } from '../../../shared/ui/InfoBox';
import { useTheme } from '../../../ThemeContext';

export const SettingsPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    applicationType: 'EMPLOYEE',
    theme: 'light',
    notifications: true,
    itemsPerPage: 10,
    language: 'ru'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings('EMPLOYEE');
      setSettings(prev => ({
        ...prev,
        ...data,
        theme: isDarkMode ? 'dark' : 'light'
      }));
      setError(null);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Не удалось загрузить настройки');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await updateSettings(settings);
      setSuccess('Настройки успешно сохранены');
      
      // Применяем тему
      if (settings.theme === 'dark' && !isDarkMode) {
        toggleTheme();
      } else if (settings.theme === 'light' && isDarkMode) {
        toggleTheme();
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <LoadingSpinner />
        <p style={styles.loadingText}>Загрузка настроек...</p>
      </div>
    );
  }

  return (
    <div style={{
      ...styles.container,
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{
        ...styles.card,
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)'
      }}>
        <div style={styles.header}>
          <h1 style={{
            ...styles.title,
            color: 'var(--text-color)'
          }}>
            ⚙️ Настройки приложения
          </h1>
        </div>

        {error && (
          <div style={styles.messageContainer}>
            <ErrorMessage error={error} onRetry={loadSettings} />
          </div>
        )}

        {success && (
          <div style={styles.successMessage}>
            <InfoBox type="success" icon="✅">
              {success}
            </InfoBox>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Внешний вид */}
          <div style={styles.section}>
            <h2 style={{
              ...styles.sectionTitle,
              color: 'var(--text-color)'
            }}>
              🎨 Внешний вид
            </h2>
            
            <div style={styles.settingItem}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Тема оформления
              </label>
              <div style={styles.themeButtons}>
                <button
                  type="button"
                  onClick={() => handleChange('theme', 'light')}
                  style={{
                    ...styles.themeButton,
                    backgroundColor: settings.theme === 'light' 
                      ? 'var(--primary-color)' 
                      : 'var(--button-bg)',
                    color: settings.theme === 'light' ? 'white' : 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  ☀️ Светлая
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('theme', 'dark')}
                  style={{
                    ...styles.themeButton,
                    backgroundColor: settings.theme === 'dark' 
                      ? 'var(--primary-color)' 
                      : 'var(--button-bg)',
                    color: settings.theme === 'dark' ? 'white' : 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  🌙 Темная
                </button>
              </div>
            </div>
          </div>

          {/* Отображение данных */}
          <div style={styles.section}>
            <h2 style={{
              ...styles.sectionTitle,
              color: 'var(--text-color)'
            }}>
              📊 Отображение данных
            </h2>
            
            <div style={styles.settingItem}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Элементов на странице
              </label>
              <select
                value={settings.itemsPerPage}
                onChange={(e) => handleChange('itemsPerPage', Number(e.target.value))}
                style={{
                  ...styles.select,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Уведомления */}
          <div style={styles.section}>
            <h2 style={{
              ...styles.sectionTitle,
              color: 'var(--text-color)'
            }}>
              🔔 Уведомления
            </h2>
            
            <div style={styles.settingItem}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Включить уведомления
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={{
                  ...styles.checkboxText,
                  color: 'var(--text-secondary)'
                }}>
                  Получать уведомления о новых операциях и изменениях статуса
                </span>
              </label>
            </div>
          </div>

          {/* Язык */}
          <div style={styles.section}>
            <h2 style={{
              ...styles.sectionTitle,
              color: 'var(--text-color)'
            }}>
              🌐 Язык
            </h2>
            
            <div style={styles.settingItem}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Язык интерфейса
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                style={{
                  ...styles.select,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Информация о системе */}
          <div style={styles.section}>
            <h2 style={{
              ...styles.sectionTitle,
              color: 'var(--text-color)'
            }}>
              ℹ️ О системе
            </h2>
            
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Версия приложения:</span>
              <span style={styles.infoValue}>1.0.0</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Тип приложения:</span>
              <span style={styles.infoValue}>Staff Service</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Последнее обновление:</span>
              <span style={styles.infoValue}>Март 2026</span>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveButton,
                backgroundColor: 'var(--primary-color)',
                opacity: saving ? 0.5 : 1,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = 'var(--primary-color)';
                }
              }}
            >
              {saving ? 'Сохранение...' : '💾 Сохранить настройки'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '100vh',
    transition: 'background-color 0.3s ease'
  },
  card: {
    borderRadius: '16px',
    padding: '30px',
    border: '1px solid',
    transition: 'all 0.3s ease'
  },
  header: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-color)'
  },
  title: {
    margin: 0,
    fontSize: '1.8em',
    fontWeight: '600'
  },
  loadingText: {
    textAlign: 'center',
    marginTop: '20px',
    color: 'var(--text-secondary)'
  },
  messageContainer: {
    marginBottom: '20px'
  },
  successMessage: {
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  section: {
    padding: '20px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.2em',
    fontWeight: '600'
  },
  settingItem: {
    marginBottom: '20px',
    ':last-child': {
      marginBottom: 0
    }
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '0.95em',
    fontWeight: '500'
  },
  themeButtons: {
    display: 'flex',
    gap: '10px'
  },
  themeButton: {
    padding: '8px 16px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'all 0.2s'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid',
    borderRadius: '8px',
    fontSize: '0.9em',
    width: '200px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  checkboxText: {
    fontSize: '0.9em'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--border-color)',
    ':last-child': {
      borderBottom: 'none'
    }
  },
  infoLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.9em'
  },
  infoValue: {
    color: 'var(--text-color)',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)'
  },
  saveButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1em',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  }
};

export default SettingsPage;