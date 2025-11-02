import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './components/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
