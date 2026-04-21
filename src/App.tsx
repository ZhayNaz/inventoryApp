import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { BusinessStats } from './components/features/BusinessStats';
import { InventoryList } from './components/features/InventoryList';
import { Navigation } from './components/layout/Navigation';
import { AddProductModal } from './components/ui/AddProductModal';
import { SettingsManager } from './components/features/SettingsManager';
import { LandingPage } from './components/auth/LandingPage';
import { SalePage } from './components/features/SalePage';
import { RestockPage } from './components/features/RestockPage';
import { ThemeToggle } from './components/layout/ThemeToggle';
import { HistoryPage } from './components/features/HistoryPage';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { LoginLoadingScreen } from './components/auth/LoginLoadingScreen';
import { LogoutLoadingScreen } from './components/auth/LogoutLoadingScreen';
import { Plus, Menu } from 'lucide-react';

function App() {
  const { 
    user, 
    loading, 
    isLoggingIn,
    isLoggingOut,
    activeTab, 
    setActiveTab, 
    settings 
  } = useInventory();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  if (isLoggingOut) {
    return <LogoutLoadingScreen />;
  }

  if (isLoggingIn) {
    return <LoginLoadingScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LandingPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <BusinessStats />;
      case 'inventory':
        return <InventoryList />;
      case 'settings':
        return <SettingsManager />;
      case 'sale':
        return <SalePage />;
      case 'restock':
        return <RestockPage />;
      case 'history':
        return <HistoryPage />;
      default:
        return <BusinessStats />;
    }
  };

  return (
    <div className="app-container">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingBottom: '1rem',
        marginBottom: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)',
        margin: 'calc(-1 * var(--safe-top)) -1.25rem 1rem -1.25rem',
        padding: 'calc(var(--safe-top) + 1.25rem) 1.25rem 1rem 1.25rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '800' }}>
            {activeTab === 'dashboard' ? 'Overview' : 
             activeTab === 'inventory' ? 'Inventory' : 
             activeTab === 'sale' ? 'Sale' : 
             activeTab === 'restock' ? 'Restock' : 
             activeTab === 'history' ? 'History' : 'Settings'}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.username}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main style={{ paddingBottom: '5rem' }}>
        {renderContent()}
      </main>

      {activeTab === 'inventory' && (
        <button 
          className="btn btn-primary" 
          onClick={() => setIsAddModalOpen(true)}
          style={{ 
            position: 'fixed', 
            right: 'max(20px, calc(10px + var(--safe-right)))', 
            bottom: 'calc(100px + var(--safe-bottom))', 
            borderRadius: '50%', 
            width: '64px', 
            height: '64px', 
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
            zIndex: 90
          }}
        >
          <Plus size={36} />
        </button>
      )}

      <AnimatePresence>
        {isSidebarOpen && (
          <Navigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
}

function Root() {
  return (
    <InventoryProvider>
      <App />
    </InventoryProvider>
  );
}

export default Root;
