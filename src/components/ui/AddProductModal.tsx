import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddProductModalProps {
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose }) => {
  const { addProduct, settings } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: 0,
    costPrice: 0,
    sellingPrice: 0,
    category: 'General'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct(formData);
    onClose();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.8)', 
      backdropFilter: 'blur(4px)',
      display: 'flex', 
      alignItems: 'end', 
      zIndex: 1000 
    }}>
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="glass-card" 
        style={{ 
          width: '100%', 
          borderBottomLeftRadius: 0, 
          borderBottomRightRadius: 0,
          maxHeight: '90dvh',
          overflowY: 'auto',
          paddingBottom: 'calc(1.5rem + var(--safe-bottom))'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Add New Product</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Product Name</label>
            <input 
              required
              className="input-field" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SKU</label>
              <input 
                required
                className="input-field" 
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Initial Stock</label>
              <input 
                type="number"
                required
                className="input-field" 
                value={formData.stock || 0}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setFormData({...formData, stock: isNaN(val) ? 0 : val});
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Cost Price ({settings.currency})</label>
              <input 
                type="number"
                step="0.01"
                required
                className="input-field" 
                value={formData.costPrice || 0}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setFormData({...formData, costPrice: isNaN(val) ? 0 : val});
                }}
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Selling Price ({settings.currency})</label>
              <input 
                type="number"
                step="0.01"
                required
                className="input-field" 
                value={formData.sellingPrice || 0}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setFormData({...formData, sellingPrice: isNaN(val) ? 0 : val});
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            Save Product
          </button>
        </form>
      </motion.div>
    </div>
  );
};
