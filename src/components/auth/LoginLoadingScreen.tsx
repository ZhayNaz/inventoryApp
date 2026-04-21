import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Fingerprint } from 'lucide-react';

export const LoginLoadingScreen: React.FC = () => {
  return (
    <div style={{ 
      height: '100dvh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%)',
      color: 'white' 
    }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', marginBottom: '3rem' }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '30px', 
            background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 50px rgba(99, 102, 241, 0.5)'
          }}
        >
          <ShieldCheck size={50} color="white" />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          style={{ position: 'absolute', bottom: -10, right: -10, background: '#10b981', padding: '8px', borderRadius: '50%', border: '4px solid #0f172a' }}
        >
          <Lock size={16} />
        </motion.div>
      </motion.div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>AUTHENTICATING</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#94a3b8' }}>
          <Fingerprint size={16} className="animate-pulse" />
          <span style={{ fontSize: '0.9rem' }}>Securing your session...</span>
        </div>
      </div>

      <div style={{ marginTop: '4rem', display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}
          />
        ))}
      </div>
    </div>
  );
};
