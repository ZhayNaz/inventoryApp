import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Smile } from 'lucide-react';

export const LogoutLoadingScreen: React.FC = () => {
  return (
    <div style={{ 
      height: '100dvh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0a0a0a',
      color: 'white' 
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 3rem' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ 
                    position: 'absolute',
                    inset: 0,
                    border: '2px dashed rgba(244, 63, 94, 0.3)',
                    borderRadius: '50%'
                }}
            />
            <div style={{ 
                position: 'absolute',
                inset: '10px',
                background: 'rgba(244, 63, 94, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-rose)'
            }}>
                <LogOut size={40} />
            </div>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem' }}>SAYING GOODBYE</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            Safely securing your data... <Smile size={20} color="var(--accent-amber)" />
        </p>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}
        >
            SEE YOU SOON
        </motion.p>
      </motion.div>
    </div>
  );
};
