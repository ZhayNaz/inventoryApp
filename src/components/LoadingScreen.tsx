import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Cloud } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const [status, setStatus] = useState('Initializing...');
  const statuses = ['Cloud Syncing...', 'Encrypting Data...', 'Securing Inventory...', 'Preparing Workspace...'];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % statuses.length;
      setStatus(statuses[i]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      height: '100dvh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Decorative blurred orbs */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'var(--primary)',
          filter: 'blur(80px)',
          top: '30%',
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotateY: [0, 180, 360]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}
        >
          <Package size={40} />
        </motion.div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            INVENTORY PRO
          </h2>
          
          <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Cloud size={14} className="animate-pulse" color="var(--primary)" />
            <AnimatePresence mode="wait">
              <motion.p
                key={status}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                style={{ fontSize: '0.8rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}
              >
                {status}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '3rem', width: '200px', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ width: '40%', height: '100%', background: 'var(--primary)', borderRadius: '2px', boxShadow: '0 0 10px var(--primary)' }}
        />
      </div>
    </div>
  );
};
