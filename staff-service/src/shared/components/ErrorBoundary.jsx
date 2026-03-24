import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Что-то пошло не так</h1>
            <p style={styles.message}>
              Произошла ошибка в приложении. Пожалуйста, попробуйте перезагрузить страницу.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Детали ошибки</summary>
                <pre style={styles.errorDetails}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReload}
              style={styles.button}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    padding: '20px'
  },
  content: {
    textAlign: 'center',
    maxWidth: '500px',
    backgroundColor: 'var(--card-bg)',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-lg)'
  },
  icon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  title: {
    fontSize: '24px',
    margin: '0 0 10px',
    color: 'var(--text-color)'
  },
  message: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '20px'
  },
  details: {
    textAlign: 'left',
    margin: '20px 0',
    padding: '10px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px'
  },
  summary: {
    cursor: 'pointer',
    color: 'var(--text-color)',
    fontWeight: 'bold'
  },
  errorDetails: {
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '200px',
    marginTop: '10px',
    color: 'var(--text-secondary)'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s'
  }
};