import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../context/InventoryContext';
import { 
  Package, 
  ShoppingCart, 
  LayoutDashboard,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const OnboardingTutorial: React.FC = () => {
  const { user, completeOnboarding } = useInventory();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Welcome to Inventory Pro!",
      description: "Let's take a quick look at how to manage your business efficiently. Your dashboard is ready.",
      icon: <Sparkles size={40} color="var(--primary)" />,
      color: "var(--primary)"
    },
    {
      id: 2,
      title: "Real-time Dashboard",
      description: "Track your total sales, profit, and inventory value at a glance. Everything updates instantly.",
      icon: <LayoutDashboard size={40} color="var(--accent-emerald)" />,
      color: "var(--accent-emerald)"
    },
    {
      id: 3,
      title: "Stock Management",
      description: "Add your products, set cost and selling prices. We'll alert you whenever stock gets low.",
      icon: <Package size={40} color="var(--accent-amber)" />,
      color: "var(--accent-amber)"
    },
    {
      id: 4,
      title: "Modern Sales Flow",
      description: "Selling is fast. Just tap items to build an order and use our floating cart to checkout from anywhere.",
      icon: <ShoppingCart size={40} color="var(--accent-rose)" />,
      color: "var(--accent-rose)"
    }
  ];

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding();
    } catch (err) {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < steps.length) setStep(step + 1);
    else handleFinish();
  };

  if (!user || user.setupComplete) return null;

  const current = steps[step - 1];

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 2000, 
      background: 'rgba(15, 23, 42, 0.95)', 
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card"
        style={{ 
          maxWidth: '450px', 
          width: '100%', 
          textAlign: 'center', 
          padding: '3rem 2rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ marginBottom: '2rem' }}
          >
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '30px', 
              background: 'rgba(255,255,255,0.03)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 2rem',
              boxShadow: `0 20px 40px -10px ${current.color}33`
            }}>
              {current.icon}
            </div>
            
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem' }}>{current.title}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.05rem' }}>
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
          {steps.map(s => (
            <div 
              key={s.id} 
              style={{ 
                width: s.id === step ? '24px' : '8px', 
                height: '8px', 
                borderRadius: '4px', 
                background: s.id === step ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
              }} 
            />
          ))}
        </div>

        <button 
          onClick={nextStep}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', borderRadius: '16px' }}
        >
          {loading ? 'Finalizing...' : (step === steps.length ? "Got it, let's go!" : "Next Overview")}
          {!loading && <ArrowRight size={20} style={{ marginLeft: '10px' }} />}
        </button>
        
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '1.5rem', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Previous
          </button>
        )}
      </motion.div>
    </div>
  );
};
