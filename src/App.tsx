import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

type AppState = 'landing' | 'auth' | 'dashboard';
function App() {
  const [currentView, setCurrentView] = useState<AppState>('landing');

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

  return (
    <ThemeProvider>
      {renderContent()}
    </ThemeProvider>
  );
}

export default App;