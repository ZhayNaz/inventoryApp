import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { TrendingUp, TrendingDown, Package, Clock, User, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export const HistoryPage: React.FC = () => {
  const { transactions, products, settings } = useInventory();

  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gap: '1rem' }}>
        {transactions.map((tx, index) => {
          const product = products.find(p => p.id === tx.productId);
          return (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card"
              style={{ padding: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ 
                    padding: '0.6rem', 
                    borderRadius: '12px', 
                    background: tx.type === 'sale' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    color: tx.type === 'sale' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                  }}>
                    {tx.type === 'sale' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{product?.name || 'Deleted Product'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={12} /> {new Date(tx.date).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: tx.type === 'sale' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {tx.type === 'sale' ? '+' : '-'}{settings.currency}{tx.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {tx.quantity}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Package size={14} /> SKU: {product?.sku || 'N/A'}
                </div>
                {tx.customerId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={14} /> Customer linked
                  </div>
                )}
                {tx.type === 'purchase' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Truck size={14} /> Supplier purchase
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {transactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Clock size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p>No transactions recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
