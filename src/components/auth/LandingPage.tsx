import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, TrendingUp, Globe, Smartphone, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login, register, guestLogin } = useInventory();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        setError('success:Welcome back! Preparing your workspace...');
      } else {
        await register(formData.email, formData.password, formData.businessName);
        setNeedsVerification(true);
        setError('success:Verification link sent to your email!');
      }
    } catch (err: any) {
      console.error("Auth Exception:", err);
      let msg = 'Authentication failed';
      const code = err.code || '';
      
      if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
        msg = 'Invalid email or password';
      } else if (code.includes('invalid-email')) {
        msg = 'Please enter a valid email address';
      } else if (code.includes('operation-not-allowed')) {
        msg = 'Email login is currently disabled';
      } else if (code.includes('email-already-in-use')) {
        msg = 'This email is already registered';
      } else if (code.includes('weak-password')) {
        msg = 'Password is too weak (min 6 chars)';
      } else if (code.includes('too-many-requests')) {
        msg = 'Too many failed attempts. Try again later.';
      }
      setError(msg);
      setLoading(false);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await guestLogin();
      setError('success:Entering Guest Mode... Synchronizing local workspace.');
    } catch (err: any) {
      setError('Guest login failed');
      setLoading(false);
      setTimeout(() => setError(''), 4000);
    }
  };

  if (needsVerification) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '2rem' }}>
        <div className="fade-in glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 2rem' }}>
            <Globe size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Verify Your Email</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            We've sent a verification link to <strong>{formData.email}</strong>. Please check your inbox and click the link to activate your account.
          </p>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem' }}
              onClick={() => window.location.reload()}
            >
              I've Verified My Email
            </button>
            <button 
              className="btn" 
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
              onClick={() => setNeedsVerification(false)}
            >
              Back to Login
            </button>
          </div>
          
          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Didn't receive code? <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Resend Link</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', padding: 'var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left)', overflow: 'hidden' }}>
      {/* Premium Alert Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '2rem',
              left: '1rem',
              right: '1rem',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div style={{
              background: error.startsWith('success:') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${error.startsWith('success:') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              maxWidth: '400px',
              width: '100%'
            }}>
              <div style={{ 
                background: error.startsWith('success:') ? '#10b981' : '#ef4444', 
                height: '8px', 
                width: '8px', 
                borderRadius: '50%', 
                boxShadow: `0 0 10px ${error.startsWith('success:') ? '#10b981' : '#ef4444'}` 
              }} />
              <p style={{ 
                color: error.startsWith('success:') ? '#a7f3d0' : '#fca5a5', 
                fontWeight: '500', 
                fontSize: '0.9rem', 
                margin: 0 
              }}>
                {error.replace('success:', '')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
              <input 
                required
                type="email" 
                className="input-field" 
                placeholder="mabie@shop.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
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
