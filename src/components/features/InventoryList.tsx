import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Search, Package, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InventoryList: React.FC = () => {
  const { products, deleteProduct, settings } = useInventory();
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="input-field" 
            style={{ paddingLeft: '40px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card"
              style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
            >
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '12px', 
                background: 'rgba(99, 102, 241, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Package size={24} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{product.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {product.sku} | Stock: <span style={{ color: product.stock < settings.lowStockThreshold ? 'var(--accent-amber)' : 'var(--text-main)' }}>{product.stock}</span></div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', color: 'var(--accent-emerald)' }}>{settings.currency}{product.sellingPrice.toFixed(2)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cost: {settings.currency}{product.costPrice.toFixed(2)}</div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                <button 
                  onClick={() => deleteProduct(product.id)}
                  title="Delete"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.5rem', cursor: 'pointer', opacity: 0.5 }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>No products found</p>
        </div>
      )}
    </div>
  );
};
