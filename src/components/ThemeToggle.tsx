import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { settings, updateSettings } = useInventory();
  const isDark = settings.theme === 'dark';

  const toggleTheme = () => {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  return (
    <motion.button
      onClick={toggleTheme}
      style={{
        width: '64px',
        height: '32px',
        borderRadius: '50px',
        background: isDark 
          ? 'linear-gradient(to right, #1e293b, #0f172a)' 
          : 'linear-gradient(to right, #38bdf8, #7dd3fc)',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isDark ? 'flex-end' : 'flex-start',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        boxShadow: isDark 
          ? 'inset 0 2px 4px rgba(0,0,0,0.5)' 
          : 'inset 0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}
    >
      {/* Background Decorative Elements */}
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="stars"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ position: 'absolute', left: '10px', display: 'flex', gap: '4px' }}
          >
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '2px', height: '2px', background: 'white', borderRadius: '50%', opacity: 0.8 }} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="clouds"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{ position: 'absolute', right: '10px', display: 'flex', gap: '2px', alignItems: 'flex-end' }}
          >
            <div style={{ width: '8px', height: '8px', background: 'rgba(255,255,255,0.8)', borderRadius: '50%' }} />
            <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', marginBottom: '-2px' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Toggle Switch Knob */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: isDark 
            ? 'linear-gradient(135deg, #cbd5e1, #94a3b8)' 
            : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 2
        }}
      >
        {isDark ? (
          <div style={{ position: 'relative' }}>
             {/* Moon Crates */}
             <div style={{ position: 'absolute', top: '-6px', left: '-2px', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }} />
             <div style={{ position: 'absolute', top: '2px', right: '-4px', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }} />
             <Moon size={14} color="#475569" fill="#475569" />
          </div>
        ) : (
          <Sun size={14} color="#b45309" fill="#b45309" />
        )}
      </motion.div>
    </motion.button>
  );
};
