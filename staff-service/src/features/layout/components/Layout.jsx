import React from 'react';
import { Header } from './Header';

export const Layout = ({ children }) => {
  return (
    <div style={styles.layout}>
      <Header />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  layout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-primary)',
    transition: 'background-color 0.3s ease'
  },
  main: {
    flex: 1,
    padding: '20px'
  }
};