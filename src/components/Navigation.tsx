import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  History, 
  PackagePlus,
  X,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { logout } = useInventory();
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
    { id: 'inventory', label: 'Inventory', icon: <Package size={22} /> },
    { id: 'sale', label: 'New Sale', icon: <ShoppingCart size={22} /> },
    { id: 'restock', label: 'Restock', icon: <PackagePlus size={22} /> },
    { id: 'history', label: 'History', icon: <History size={22} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={22} /> },
  ];

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(4px)',
          pointerEvents: 'auto'
        }}
      />

      {/* Sidebar */}
      <motion.nav 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          bottom: 0, 
          width: '280px', 
          background: 'var(--bg-dark)', 
          borderLeft: '1px solid var(--glass-border)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
          pointerEvents: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--primary)' }}>Inventory Pro</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-main)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: activeTab === tab.id ? '600' : '400',
                pointerEvents: 'auto'
              }}
            >
              <div style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</div>
              <span>{tab.label}</span>
            </button>
          ))}
          
          <button 
            onClick={() => {
              logout();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              color: 'var(--accent-rose)',
              textAlign: 'left',
              cursor: 'pointer',
              marginTop: '0.5rem',
              pointerEvents: 'auto'
            }}
          >
            <LogOut size={22} />
            <span>Log Out</span>
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Version 2.0.0 Cloud</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Sync Status: Online</div>
        </div>
      </motion.nav>
    </div>
  );
};
