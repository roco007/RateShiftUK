import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClientVault } from './components/ClientVault';
import { BreakEvenCalculator } from './components/BreakEvenCalculator';
import { RateTracker } from './components/RateTracker';
import { EmailGenerator } from './components/EmailGenerator';
import { Alerts } from './components/Alerts';
import { Reports } from './components/Reports';

function AppContent() {
  const { state } = useApp();

  const renderView = () => {
    switch (state.currentView) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <ClientVault />;
      case 'calculator': return <BreakEvenCalculator />;
      case 'rates': return <RateTracker />;
      case 'emails': return <EmailGenerator />;
      case 'alerts': return <Alerts />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
