import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Globe, 
  Smartphone, 
  ArrowRight, 
  UserX, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  X,
  Mail,
  Lock,
  Building
} from 'lucide-react';

interface AuthFeedback {
  type: 'error' | 'success';
  title: string;
  message: string;
  isUserNotFound?: boolean;
  code?: string;
}

export const LandingPage: React.FC = () => {
  const { user, login, register, upgradeAccount, guestLogin } = useInventory();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authFeedback, setAuthFeedback] = useState<AuthFeedback | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: ''
  });

  const parseAuthError = (err: unknown, isLoginMode: boolean): AuthFeedback => {
    console.error('Auth Exception:', err);
    let code = '';
    let rawMessage = '';

    if (typeof err === 'object' && err !== null) {
      const obj = err as Record<string, unknown>;
      code = typeof obj.code === 'string' ? obj.code : '';
      rawMessage = typeof obj.message === 'string' ? obj.message : '';
    } else if (typeof err === 'string') {
      rawMessage = err;
    }

    const combined = `${code} ${rawMessage}`.toLowerCase();

    // 1. User not found
    if (
      code === 'auth/user-not-found' ||
      combined.includes('user-not-found') ||
      combined.includes('user not found') ||
      combined.includes('no user found') ||
      combined.includes('no user record')
    ) {
      return {
        type: 'error',
        code: 'auth/user-not-found',
        title: 'User Not Found',
        message: 'No account was found with this email address. Please check your spelling or sign up for a new account.',
        isUserNotFound: true
      };
    }

    // 2. Invalid credentials (in Firebase Auth with enumeration protection, unexisting users & wrong pass throw this)
    if (code === 'auth/invalid-credential' || combined.includes('invalid-credential')) {
      if (isLoginMode) {
        return {
          type: 'error',
          code: 'auth/invalid-credential',
          title: 'Account Not Found or Invalid Password',
          message: 'No matching user was found with these credentials, or the password was incorrect. If you do not have an account yet, please sign up.',
          isUserNotFound: true
        };
      }
      return {
        type: 'error',
        code: 'auth/invalid-credential',
        title: 'Invalid Credentials',
        message: 'Invalid credentials provided. Please check your details and try again.',
        isUserNotFound: false
      };
    }

    // 3. Incorrect Password
    if (code === 'auth/wrong-password' || combined.includes('wrong-password') || combined.includes('incorrect password')) {
      return {
        type: 'error',
        code: 'auth/wrong-password',
        title: 'Incorrect Password',
        message: 'The password you entered is incorrect. Please try again.',
        isUserNotFound: false
      };
    }

    // 4. Invalid Email
    if (code === 'auth/invalid-email' || combined.includes('invalid-email')) {
      return {
        type: 'error',
        code: 'auth/invalid-email',
        title: 'Invalid Email Address',
        message: 'Please enter a valid email address format (e.g. name@example.com).',
        isUserNotFound: false
      };
    }

    // 5. Email Already in Use
    if (code === 'auth/email-already-in-use' || combined.includes('email-already-in-use') || combined.includes('email already in use')) {
      return {
        type: 'error',
        code: 'auth/email-already-in-use',
        title: 'Email Already Registered',
        message: 'An account with this email address already exists. Please log in instead.',
        isUserNotFound: false
      };
    }

    // 6. Weak Password
    if (code === 'auth/weak-password' || combined.includes('weak-password')) {
      return {
        type: 'error',
        code: 'auth/weak-password',
        title: 'Password Too Weak',
        message: 'Password must be at least 6 characters long.',
        isUserNotFound: false
      };
    }

    // 7. Too Many Requests / Temporarily Locked
    if (code === 'auth/too-many-requests' || combined.includes('too-many-requests')) {
      return {
        type: 'error',
        code: 'auth/too-many-requests',
        title: 'Access Temporarily Blocked',
        message: 'Too many unsuccessful attempts. Access is temporarily locked for security. Please try again in a few minutes.',
        isUserNotFound: false
      };
    }

    // 8. Account Disabled
    if (code === 'auth/user-disabled' || combined.includes('user-disabled')) {
      return {
        type: 'error',
        code: 'auth/user-disabled',
        title: 'Account Disabled',
        message: 'This user account has been disabled. Please contact support.',
        isUserNotFound: false
      };
    }

    // 9. Network Connection Error
    if (code === 'auth/network-request-failed' || combined.includes('network') || combined.includes('offline')) {
      return {
        type: 'error',
        code: 'auth/network-request-failed',
        title: 'Network Error',
        message: 'Unable to connect to the authentication server. Please check your internet connection.',
        isUserNotFound: false
      };
    }

    // 10. Operation not allowed
    if (code === 'auth/operation-not-allowed' || combined.includes('operation-not-allowed')) {
      return {
        type: 'error',
        code: 'auth/operation-not-allowed',
        title: 'Sign In Disabled',
        message: 'Email and password authentication is not enabled on this project.',
        isUserNotFound: false
      };
    }

    // 11. Security timeout / requires recent login
    if (code === 'auth/requires-recent-login' || combined.includes('requires-recent-login')) {
      return {
        type: 'error',
        code: 'auth/requires-recent-login',
        title: 'Session Expired',
        message: 'Security timeout. Please sign in again to continue.',
        isUserNotFound: false
      };
    }

    // Fallback message with Firebase prefix stripped
    const cleanMsg = rawMessage
      ? rawMessage.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[^)]+\)\.?$/i, '').trim()
      : 'Authentication failed. Please check your details and try again.';

    return {
      type: 'error',
      title: 'Authentication Failed',
      message: cleanMsg || 'Authentication failed. Please try again.',
      isUserNotFound: false
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthFeedback(null);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        setAuthFeedback({
          type: 'success',
          title: 'Welcome Back!',
          message: 'Preparing your workspace...'
        });
      } else {
        // PREVENTION: If they are currently a guest, we MUST upgrade them to keep their data
        if (user?.isGuest) {
          await upgradeAccount(formData.email, formData.password);
          setAuthFeedback({
            type: 'success',
            title: 'Account Upgraded!',
            message: 'Guest account upgraded! Your data is now synced to your email.'
          });
        } else {
          await register(formData.email, formData.password, formData.businessName);
          setNeedsVerification(true);
          setAuthFeedback({
            type: 'success',
            title: 'Verification Sent',
            message: 'Verification link sent to your email!'
          });
        }
      }
    } catch (err: unknown) {
      const feedback = parseAuthError(err, isLogin);
      setAuthFeedback(feedback);
      setLoading(false);
      
      if (!feedback.isUserNotFound) {
        setTimeout(() => {
          setAuthFeedback(prev => (prev === feedback ? null : prev));
        }, 6000);
      }
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setAuthFeedback(null);
    try {
      await guestLogin();
      setAuthFeedback({
        type: 'success',
        title: 'Guest Mode',
        message: 'Entering Guest Mode... Synchronizing local workspace.'
      });
    } catch (err) {
      const feedback = parseAuthError(err, false);
      setAuthFeedback(feedback);
      setLoading(false);
      setTimeout(() => {
        setAuthFeedback(prev => (prev === feedback ? null : prev));
      }, 5000);
    }
  };

  const handleSwitchToSignup = () => {
    setIsLogin(false);
    setAuthFeedback(null);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
    setAuthFeedback(null);
  };

  const hasError = authFeedback?.type === 'error';

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
      {/* Floating Alert Toast Overlay */}
      <AnimatePresence>
        {authFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: 'clamp(1rem, 3vw, 2rem)',
              left: '1rem',
              right: '1rem',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <div 
              style={{
                pointerEvents: 'auto',
                background: authFeedback.type === 'success' 
                  ? 'rgba(6, 78, 59, 0.85)' 
                  : 'rgba(69, 10, 10, 0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${authFeedback.type === 'success' ? 'rgba(52, 211, 153, 0.35)' : 'rgba(248, 113, 113, 0.35)'}`,
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                boxShadow: authFeedback.type === 'success' 
                  ? '0 12px 35px rgba(16, 185, 129, 0.25)' 
                  : '0 12px 35px rgba(239, 68, 68, 0.3)',
                maxWidth: '440px',
                width: '100%'
              }}
            >
              <div style={{
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: authFeedback.type === 'success' ? '#34d399' : '#f87171',
                flexShrink: 0
              }}>
                {authFeedback.type === 'success' ? (
                  <CheckCircle2 size={22} />
                ) : authFeedback.isUserNotFound ? (
                  <UserX size={22} />
                ) : (
                  <AlertCircle size={22} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  color: authFeedback.type === 'success' ? '#a7f3d0' : '#fecaca', 
                  fontWeight: '700', 
                  fontSize: '0.92rem',
                  lineHeight: 1.3
                }}>
                  {authFeedback.title}
                </div>
                <div style={{ 
                  color: authFeedback.type === 'success' ? '#d1fae5' : '#fca5a5', 
                  fontSize: '0.82rem', 
                  marginTop: '0.25rem',
                  lineHeight: '1.45'
                }}>
                  {authFeedback.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAuthFeedback(null)}
                aria-label="Close notification"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: authFeedback.type === 'success' ? '#a7f3d0' : '#fca5a5',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.8,
                  transition: 'opacity 0.2s',
                  flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: 'clamp(1rem, 5vw, 3rem) clamp(1rem, 5vw, 2rem) 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ padding: '0.4rem', borderRadius: '15px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/favicon.png" alt="Inventory Pro logo" style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }} />
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
              onClick={handleSwitchToLogin}
              style={{ 
                flex: 1, 
                background: 'none', 
                border: 'none', 
                color: isLogin ? 'var(--primary)' : 'var(--text-muted)', 
                fontWeight: '700', 
                borderBottom: isLogin ? '2px solid var(--primary)' : 'none', 
                paddingBottom: '0.5rem', 
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              LOG IN
            </button>
            <button 
              onClick={handleSwitchToSignup}
              style={{ 
                flex: 1, 
                background: 'none', 
                border: 'none', 
                color: !isLogin ? 'var(--primary)' : 'var(--text-muted)', 
                fontWeight: '700', 
                borderBottom: !isLogin ? '2px solid var(--primary)' : 'none', 
                paddingBottom: '0.5rem', 
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
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
                  style={{ marginBottom: 0 }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <Building size={14} />
                    Business Name
                  </label>
                  <input 
                    required
                    type="text" 
                    className="input-field" 
                    placeholder="Enter shop or company name"
                    value={formData.businessName}
                    onChange={e => {
                      setFormData({...formData, businessName: e.target.value});
                      if (hasError) setAuthFeedback(null);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <Mail size={14} />
                Email Address
              </label>
              <input 
                required
                type="email" 
                className="input-field" 
                placeholder="example@email.com"
                value={formData.email}
                onChange={e => {
                  setFormData({...formData, email: e.target.value});
                  if (hasError) setAuthFeedback(null);
                }}
                style={{
                  borderColor: (hasError && (authFeedback?.isUserNotFound || authFeedback?.code?.includes('email'))) 
                    ? '#f87171' 
                    : undefined,
                  boxShadow: (hasError && (authFeedback?.isUserNotFound || authFeedback?.code?.includes('email')))
                    ? '0 0 0 2px rgba(248, 113, 113, 0.2)'
                    : undefined
                }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <Lock size={14} />
                Password
              </label>
              <input 
                required
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => {
                  setFormData({...formData, password: e.target.value});
                  if (hasError) setAuthFeedback(null);
                }}
                style={{
                  borderColor: (hasError && (authFeedback?.code?.includes('password') || authFeedback?.isUserNotFound))
                    ? '#f87171' 
                    : undefined,
                  boxShadow: (hasError && (authFeedback?.code?.includes('password') || authFeedback?.isUserNotFound))
                    ? '0 0 0 2px rgba(248, 113, 113, 0.2)'
                    : undefined
                }}
              />
            </div>

            {/* Contextual In-Form Alert for User Not Found & Errors */}
            <AnimatePresence>
              {hasError && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.35)',
                      borderRadius: '14px',
                      padding: '0.9rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <div style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }}>
                        {authFeedback?.isUserNotFound ? <UserX size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fca5a5', fontWeight: '700', fontSize: '0.85rem' }}>
                          {authFeedback?.title}
                        </div>
                        <div style={{ color: '#fecaca', fontSize: '0.8rem', lineHeight: '1.4', marginTop: '0.2rem' }}>
                          {authFeedback?.message}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action when User is Not Found */}
                    {authFeedback?.isUserNotFound && isLogin && (
                      <button
                        type="button"
                        onClick={handleSwitchToSignup}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          background: 'rgba(99, 102, 241, 0.25)',
                          border: '1px solid rgba(99, 102, 241, 0.45)',
                          borderRadius: '10px',
                          color: '#e0e7ff',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          marginTop: '0.25rem',
                          transition: 'background 0.2s'
                        }}
                      >
                        <UserPlus size={15} />
                        <span>Sign up with this email instead</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Processing...' : (isLogin ? 'Login Account' : 'Create Account')}
              {!loading && <ArrowRight size={20} />}
            </button>

            <button 
              type="button" 
              onClick={handleGuestLogin}
              disabled={loading} 
              className="btn" 
              style={{ width: '100%', padding: '1rem', marginTop: '0.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
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

