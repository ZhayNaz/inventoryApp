import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { TrendingUp, TrendingDown, Package, Clock, User, Truck, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FilterType = 'all' | 'daily' | 'monthly' | 'yearly';

export const HistoryPage: React.FC = () => {
  const { transactions, products, settings } = useInventory();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      if (filter === 'daily') return txDate >= today;
      if (filter === 'monthly') return txDate >= startOfMonth;
      if (filter === 'yearly') return txDate >= startOfYear;
      return true;
    });
  }, [transactions, filter]);

  const stats = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      if (tx.type === 'sale') {
        acc.sales += tx.amount;
        acc.salesCount++;
      } else {
        acc.purchases += tx.amount;
        acc.purchasesCount++;
      }
      return acc;
    }, { sales: 0, purchases: 0, salesCount: 0, purchasesCount: 0 });
  }, [filteredTransactions]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {(['all', 'daily', 'monthly', 'yearly'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: '1px solid var(--glass-border)',
                background: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: filter === f ? 'white' : 'var(--text-main)',
                textTransform: 'capitalize',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {f === 'all' ? 'All Time' : f}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={14} color="var(--accent-emerald)" /> Sales ({stats.salesCount})
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
              {settings.currency}{stats.sales.toLocaleString()}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingDown size={14} color="var(--accent-rose)" /> Purchases ({stats.purchasesCount})
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-rose)' }}>
              {settings.currency}{stats.purchases.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <AnimatePresence>
          {filteredTransactions.map((tx, index) => {
            const product = products.find(p => p.id === tx.productId);
            return (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
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
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: tx.type === 'sale' ? 'var(--accent-emerald)' : 'var(--accent-rose)', textAlign: 'right' }}>
                      {tx.type === 'sale' ? '+' : '-'}{settings.currency}{tx.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>Qty: {tx.quantity}</div>
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
        </AnimatePresence>

        {filteredTransactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Calendar size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p>No transactions recorded for this period.</p>
          </div>
        )}
      </div>
    </div>
  );
};
