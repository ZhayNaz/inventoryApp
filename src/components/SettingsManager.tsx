import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { User, Trash2, LogOut, ChevronRight, Building, DollarSign, AlertCircle } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { user, settings, updateSettings, clearAllData, logout } = useInventory();

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all inventory and transactions? This cannot be undone.')) {
      clearAllData();
      alert('All data has been cleared.');
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '2rem' }}>
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem' }}>{user?.username || 'Administrator'}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{settings.businessName}</p>
          </div>
        </div>
        
        <div className="input-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <Building size={16} /> Business Name
          </label>
          <input 
            type="text" 
            className="input-field" 
            value={settings.businessName}
            onChange={(e) => updateSettings({ businessName: e.target.value })}
          />
        </div>
      </div>

      <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', marginLeft: '0.5rem' }}>Business Configuration</h3>
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'grid', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ color: 'var(--primary)' }}><DollarSign size={20} /></div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Currency Symbol</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Set your preferred currency</div>
            </div>
          </div>
          <select 
            value={settings.currency} 
            onChange={(e) => updateSettings({ currency: e.target.value })}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem', borderRadius: '8px' }}
          >
            <option value="$">USD ($)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
            <option value="₱">PHP (₱)</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ color: 'var(--accent-amber)' }}><AlertCircle size={20} /></div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Low Stock Alert</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Threshold for warnings</div>
            </div>
          </div>
          <input 
            type="number"
            value={settings.lowStockThreshold}
            onChange={(e) => updateSettings({ lowStockThreshold: parseInt(e.target.value) })}
            style={{ width: '60px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem', borderRadius: '8px', textAlign: 'center' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ color: 'var(--accent-emerald)' }}><Building size={20} /></div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Initial Capital</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base investment amount</div>
            </div>
          </div>
          <input 
            type="number"
            value={settings.initialCapital}
            onChange={(e) => updateSettings({ initialCapital: parseInt(e.target.value) })}
            style={{ width: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem', borderRadius: '8px', textAlign: 'center' }}
          />
        </div>
      </div>
      
      

      <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', marginLeft: '0.5rem' }}>Danger Zone</h3>
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <button 
          onClick={handleClearData}
          style={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: 'none', 
            border: 'none', 
            color: 'var(--accent-rose)', 
            cursor: 'pointer',
            padding: '0.5rem 0'
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Trash2 size={20} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Clear All Data</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Reset inventory and transactions</div>
            </div>
          </div>
          <ChevronRight size={20} />
        </button>
      </div>

      <button 
        className="btn" 
        onClick={logout}
        style={{ width: '100%', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.2)' }}
      >
        <LogOut size={20} /> Logout
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
        Inventory Pro v1.0.4 | Made with ❤️
      </p>
    </div>
  );
};
