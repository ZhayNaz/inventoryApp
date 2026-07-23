import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { User, Trash2, ChevronRight, Building, DollarSign, AlertCircle, RefreshCcw, Headphones, MessageSquareShare } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { user, settings, updateSettings, clearAllData, clearCache, upgradeAccount, syncAllToCloud, lastSynced } = useInventory();
  const isGuestMode = Boolean(user?.isGuest);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!upgradeForm.email.trim() || !upgradeForm.password || !upgradeForm.confirmPassword) {
      setUpgradeError('Please fill in your email, password, and confirm password.');
      return;
    }

    if (upgradeForm.password !== upgradeForm.confirmPassword) {
      setUpgradeError('Passwords do not match.');
      return;
    }

    setUpgradeLoading(true);
    setUpgradeError('');
    setUpgradeMessage('');

    try {
      await upgradeAccount(upgradeForm.email, upgradeForm.password);
      setUpgradeMessage('Verification email sent. Please open the link in your inbox to complete the account upgrade.');
      setUpgradeForm({ email: '', password: '', confirmPassword: '' });
      setIsUpgrading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Linking failed';
      setUpgradeError(message);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncAllToCloud();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleGuestPrompt = () => {
    setIsUpgrading(true);
  };

  const handleClearData = () => {
    if (isGuestMode) {
      handleGuestPrompt();
      return;
    }

    if (confirm('Are you sure you want to clear all inventory and transactions? This cannot be undone.')) {
      clearAllData();
      alert('All data was cleared.');
    }
  };

  const handleClearCache = () => {
    if (isGuestMode) {
      handleGuestPrompt();
      return;
    }

    if (confirm('Clear local cache and reload? Your cloud data will remain safe.')) {
      clearCache();
    }
  };

  const handleContactSupport = () => {
    window.open('https://www.facebook.com/assistanceprobotics/', '_blank');
  };

  const handleSendFeedback = () => {
    window.open('https://www.facebook.com/assistanceprobotics/', '_blank');
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '2rem' }}>
      {user?.isGuest && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Secure Your Data</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You're currently using a guest session. Link an email to save your data permanently.</p>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)' }}>
              <Building size={20} />
            </div>
          </div>

          {!isUpgrading ? (
            <button
              className="btn btn-primary"
              onClick={() => setIsUpgrading(true)}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Convert to Permanent Account
            </button>
          ) : (
            <form onSubmit={handleUpgrade} style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
              <input
                required
                type="email"
                className="input-field"
                placeholder="Your email address"
                value={upgradeForm.email}
                onChange={e => setUpgradeForm({ ...upgradeForm, email: e.target.value })}
              />
              <input
                required
                type="password"
                className="input-field"
                placeholder="Create a password"
                value={upgradeForm.password}
                onChange={e => setUpgradeForm({ ...upgradeForm, password: e.target.value })}
              />
              <input
                required
                type="password"
                className="input-field"
                placeholder="Confirm password"
                value={upgradeForm.confirmPassword}
                onChange={e => setUpgradeForm({ ...upgradeForm, confirmPassword: e.target.value })}
              />
              {upgradeError && <p style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{upgradeError}</p>}
              {upgradeMessage && <p style={{ color: 'var(--accent-emerald)', fontSize: '0.75rem' }}>{upgradeMessage}</p>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" disabled={upgradeLoading} className="btn btn-primary" style={{ flex: 1 }}>
                  {upgradeLoading ? 'Processing...' : 'Send Verification Email'}
                </button>
                <button type="button" onClick={() => { setIsUpgrading(false); setUpgradeError(''); setUpgradeMessage(''); }} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

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
            disabled={isGuestMode}
            placeholder={isGuestMode ? 'Sign in or create an account to edit' : 'Enter business name'}
          />
          {isGuestMode && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Sign in or create an account to manage your business details securely.
            </p>
          )}
        </div>
      </div>

      <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', marginLeft: '0.5rem' }}>Cloud Synchronization</h3>
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ color: 'var(--primary)' }}>
              <RefreshCcw size={20} className={isSyncing ? 'spinner' : ''} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Cloud Backup</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {lastSynced ? `Last synced at ${lastSynced}` : 'Not synced yet this session'}
              </div>
            </div>
          </div>
          <button 
            onClick={isGuestMode ? handleGuestPrompt : handleManualSync}
            disabled={isSyncing || isGuestMode}
            className="btn btn-primary" 
            style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
          >
            {isGuestMode ? 'Login / Create Account' : isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
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

      <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', marginLeft: '0.5rem' }}>Support & Feedback</h3>
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'grid', gap: '1rem' }}>
        <button
          onClick={handleContactSupport}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0.5rem 0' }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Headphones size={20} style={{ color: 'var(--primary)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Customer Service</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get help with your account</div>
            </div>
          </div>
          <ChevronRight size={20} style={{ opacity: 0.5 }} />
        </button>

        <div style={{ height: '1px', background: 'var(--glass-border)' }} />

        <button
          onClick={handleSendFeedback}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0.5rem 0' }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <MessageSquareShare size={20} style={{ color: 'var(--accent-emerald)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Feedback Report</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Suggest features or report bugs</div>
            </div>
          </div>
          <ChevronRight size={20} style={{ opacity: 0.5 }} />
        </button>
      </div>

      <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', marginLeft: '0.5rem' }}>Danger Zone</h3>
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'grid', gap: '1rem' }}>
        {isGuestMode && (
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Sign in or create an account to unlock these controls and protect your data better.
          </div>
        )}
        <button
          onClick={handleClearCache}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: isGuestMode ? 'var(--text-muted)' : 'var(--text-main)',
            cursor: isGuestMode ? 'not-allowed' : 'pointer',
            padding: '0.5rem 0',
            opacity: isGuestMode ? 0.7 : 1
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <RefreshCcw size={20} style={{ color: 'var(--primary)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Clear Local Cache</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fix sync issues, data stays safe</div>
            </div>
          </div>
          <ChevronRight size={20} style={{ opacity: 0.5 }} />
        </button>

        <div style={{ height: '1px', background: 'var(--glass-border)' }} />

        <button
          onClick={handleClearData}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: isGuestMode ? 'var(--text-muted)' : 'var(--accent-rose)',
            cursor: isGuestMode ? 'not-allowed' : 'pointer',
            padding: '0.5rem 0',
            opacity: isGuestMode ? 0.7 : 1
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

      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
        Inventory Pro v1.0.4 | Made By Zhay
      </p>
    </div>
  );
};
