import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, TrendingUp, Globe, Smartphone, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login, register, guestLogin } = useInventory();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    businessName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        await register(formData.username, formData.password, formData.businessName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await guestLogin();
    } catch (err: any) {
      setError(err.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', padding: 'var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left)' }}>
      <div style={{ padding: 'clamp(1rem, 5vw, 3rem) clamp(1rem, 5vw, 2rem) 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '15px', background: 'linear-gradient(135deg, var(--primary), #818cf8)' }}>
            <Package color="white" size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', lineHeight: '1' }}>Inventory Pro</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cloud Sync Business Suite</p>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5', maxWidth: '300px' }}>
          Manage your business stats and inventory seamlessly across all your devices.
        </p>
      </div>

      <div style={{ flex: 1, padding: '0 2rem 3rem' }}>
        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              onClick={() => setIsLogin(true)}
              style={{ flex: 1, background: 'none', border: 'none', color: isLogin ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700', borderBottom: isLogin ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer' }}
            >
              LOG IN
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              style={{ flex: 1, background: 'none', border: 'none', color: !isLogin ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700', borderBottom: !isLogin ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer' }}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="input-group"
                >
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Business Name</label>
                  <input 
                    required
                    type="text" 
                    className="input-field" 
                    placeholder="Enter shop name"
                    value={formData.businessName}
                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Username</label>
              <input 
                required
                type="text" 
                className="input-field" 
                placeholder="mabie_shop"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Password</label>
              <input 
                required
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {error && <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
              {loading ? 'Processing...' : (isLogin ? 'Login Account' : 'Create Account')}
              {!loading && <ArrowRight size={20} />}
            </button>

            <button 
              type="button" 
              onClick={handleGuestLogin}
              disabled={loading} 
              className="btn" 
              style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
            >
              Continue as Guest
            </button>
          </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><Globe size={24} style={{ margin: '0 auto' }} /></div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cloud Sync</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}><TrendingUp size={24} style={{ margin: '0 auto' }} /></div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Live Stats</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--accent-amber)', marginBottom: '0.5rem' }}><Smartphone size={24} style={{ margin: '0 auto' }} /></div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Multi Device</div>
          </div>
        </div>
      </div>
    </div>
  );
};
