import React, { useState } from 'react';
import { useInventory, type Product } from '../../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, TrendingUp, User, Truck } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  type: 'sale' | 'purchase';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, product, type }) => {
  const { recordTransaction, customers, suppliers } = useInventory();
  const [quantity, setQuantity] = useState(1);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amount = type === 'sale' ? product.sellingPrice * quantity : product.costPrice * quantity;
      
      await recordTransaction({
        productId: product.id,
        type,
        quantity,
        amount,
        customerId: (type === 'sale' && selectedEntityId) ? selectedEntityId : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 100, 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'center' 
      }}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        />
        
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-card"
          style={{ 
            width: '100%', 
            maxWidth: '500px', 
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative', 
            zIndex: 101,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            paddingBottom: 'calc(1.5rem + var(--safe-bottom))',
            boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ 
                padding: '0.5rem', 
                borderRadius: '10px', 
                background: type === 'sale' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: type === 'sale' ? 'var(--accent-rose)' : 'var(--accent-emerald)'
              }}>
                {type === 'sale' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
              </div>
              <h2 style={{ fontSize: '1.25rem' }}>{type === 'sale' ? 'Sell Item' : 'Restock Item'}</h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Product</div>
            <div style={{ fontWeight: '600' }}>{product.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Stock: {product.stock}</div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Quantity</label>
              <input 
                type="number" 
                min="1" 
                max={type === 'sale' ? product.stock : 9999}
                className="input-field"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            {type === 'sale' ? (
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <User size={14} /> Customer (Optional)
                </label>
                <select 
                  className="input-field" 
                  value={selectedEntityId} 
                  onChange={e => setSelectedEntityId(e.target.value)}
                  style={{ appearance: 'none' }}
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <Truck size={14} /> Supplier (Optional)
                </label>
                <select 
                  className="input-field" 
                  value={selectedEntityId} 
                  onChange={e => setSelectedEntityId(e.target.value)}
                  style={{ appearance: 'none' }}
                >
                  <option value="">Default Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: type === 'sale' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  ${((type === 'sale' ? product.sellingPrice : product.costPrice) * quantity).toFixed(2)}
                </span>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || (type === 'sale' && quantity > product.stock)} 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem', background: type === 'sale' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}
              >
                {loading ? 'Processing...' : (type === 'sale' ? 'Confirm Sale' : 'Confirm Restock')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
