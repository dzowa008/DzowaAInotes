import React from 'react';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

type AppState = 'landing' | 'auth' | 'dashboard';
function App() {
  const [currentView, setCurrentView] = useState<AppState>('landing');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ThemeProvider>
      {renderContent()}
    </ThemeProvider>
  );

  function renderContent() {
  if (currentView === 'dashboard') {
    return <Dashboard />;
  }

  if (currentView === 'auth') {
    return (
      <AuthPage 
        onAuthSuccess={() => setCurrentView('dashboard')}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <LandingPage 
      onGetStarted={() => setCurrentView('auth')} 
    />
  );
  }
}

export default App;