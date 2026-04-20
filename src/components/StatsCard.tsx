import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'up' | 'down';
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, trend, trendType }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: '1.25rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>{label}</span>
        <div style={{ color: 'var(--primary)', opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{value}</div>
      {trend && (
        <div style={{ 
          fontSize: '0.75rem', 
          marginTop: '0.5rem', 
          color: trendType === 'up' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {trendType === 'up' ? '↑' : '↓'} {trend}
        </div>
      )}
    </motion.div>
  );
};
