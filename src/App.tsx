import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { OnboardingTutorial } from './components/ui/OnboardingTutorial';
import { Plus, Menu, ShoppingCart, PackagePlus } from 'lucide-react';

function App() {
  const { 
    user, 
    loading, 
    isLoggingIn,
    isLoggingOut,
    activeTab, 
    setActiveTab, 
    settings,
    cart,
    restockCart,
    setSaleView
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

  const saleButtonBottom = cart.length > 0 ? 'calc(5.5rem + var(--safe-bottom))' : 'calc(1rem + var(--safe-bottom))';
  const cartButtonBottom = restockCart.length > 0 && activeTab !== 'restock' ? 'calc(8.5rem + var(--safe-bottom))' : 'calc(1rem + var(--safe-bottom))';
  const restockButtonBottom = cart.length > 0 && activeTab !== 'sale' ? 'calc(5.5rem + var(--safe-bottom))' : 'calc(1rem + var(--safe-bottom))';

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
            right: 'max(1rem, calc(1rem + var(--safe-right)))', 
            bottom: 'calc(1rem + var(--safe-bottom))', 
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

      {activeTab === 'dashboard' && (
        <motion.button
          initial={{ scale: 0, y: 100, x: 100 }}
          animate={{ scale: 1, y: 0, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSaleView('products');
            setActiveTab('sale');
          }}
          style={{
            position: 'fixed',
            bottom: saleButtonBottom,
            right: 'max(1rem, calc(1rem + var(--safe-right)))',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'var(--accent-emerald)',
            color: 'white',
            border: 'none',
            boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Start new sale"
        >
          <ShoppingCart size={28} strokeWidth={2.5} />
        </motion.button>
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

      {/* Global Floating Cart Notification */}
      <AnimatePresence>
        {cart.length > 0 && activeTab !== 'sale' && (
          <motion.button
            initial={{ scale: 0, y: 100, x: 100 }}
            animate={{ scale: 1, y: 0, x: 0 }}
            exit={{ scale: 0, y: 100, x: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSaleView('checkout');
              setActiveTab('sale');
            }}
            style={{
              position: 'fixed',
              bottom: cartButtonBottom,
              right: 'max(1rem, calc(1rem + var(--safe-right)))',
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5)',
              cursor: 'pointer',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShoppingCart size={28} strokeWidth={2.5} />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ 
                position: 'absolute', 
                top: '-8px', 
                right: '-8px', 
                background: 'var(--accent-rose)', 
                color: 'white', 
                minWidth: '24px', 
                height: '24px', 
                padding: '0 6px', 
                borderRadius: '12px', 
                fontSize: '0.75rem', 
                fontWeight: '900', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 4px 12px rgba(244, 63, 94, 0.4)',
                border: '2px solid var(--bg-dark)' 
              }}
            >
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Global Floating Restock Notification */}
      <AnimatePresence>
        {restockCart.length > 0 && activeTab !== 'restock' && (
          <motion.button
            initial={{ scale: 0, y: 100, x: 100 }}
            animate={{ scale: 1, y: 0, x: 0 }}
            exit={{ scale: 0, y: 100, x: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('restock')}
            style={{
              position: 'fixed',
              bottom: restockButtonBottom,
              right: 'max(1rem, calc(1rem + var(--safe-right)))',
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--accent-emerald)',
              color: 'white',
              border: 'none',
              boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
              cursor: 'pointer',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PackagePlus size={28} strokeWidth={2.5} />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ 
                position: 'absolute', 
                top: '-8px', 
                right: '-8px', 
                background: 'white', 
                color: 'var(--accent-emerald)', 
                minWidth: '24px', 
                height: '24px', 
                padding: '0 6px', 
                borderRadius: '12px', 
                fontSize: '0.75rem', 
                fontWeight: '900', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                border: '2px solid var(--accent-emerald)' 
              }}
            >
              {restockCart.reduce((a, b) => a + b.quantity, 0)}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      <OnboardingTutorial />
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
