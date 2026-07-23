import React, { useCallback, useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { X, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddProductModalProps {
  onClose: () => void;
  product?: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    costPrice: number;
    sellingPrice: number;
    imageUrl?: string;
  } | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, product }) => {
  const { addProduct, updateProduct, settings, products } = useInventory();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    stock: product?.stock || 0,
    costPrice: product?.costPrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    category: 'General',
    imageUrl: product?.imageUrl || ''
  });

  const generateSku = useCallback((name: string) => {
    const base = name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '')
      .slice(0, 6) || 'ITEM';

    const existingSkus = new Set(products.map(item => item.sku.toUpperCase()));
    let counter = 1;
    let candidate = `${base}${counter.toString().padStart(3, '0')}`;

    while (existingSkus.has(candidate)) {
      counter += 1;
      candidate = `${base}${counter.toString().padStart(3, '0')}`;
    }

    return candidate;
  }, [products]);

  const displayedSku = product ? formData.sku : formData.sku || generateSku(formData.name);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      }
    };
    reader.onerror = () => console.error('Failed to read image');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      sku: formData.sku.trim() || generateSku(formData.name)
    };

    if (product) {
      updateProduct(product.id, payload);
    } else {
      addProduct(payload);
    }
    onClose();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.8)', 
      backdropFilter: 'blur(4px)',
      display: 'flex', 
      alignItems: 'start',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 1000
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{ 
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90dvh',
          overflowY: 'auto',
          borderRadius: '1rem',
          paddingBottom: 'calc(1.5rem + var(--safe-bottom))'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Item Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label htmlFor="product-image" style={{
                width: '96px',
                height: '96px',
                border: '1px dashed rgba(255,255,255,0.28)',
                borderRadius: '1rem',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0
              }}>
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Product preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <ImagePlus size={24} style={{ marginBottom: '0.25rem' }} />
                    <div style={{ fontSize: '0.7rem' }}>Add image</div>
                  </div>
                )}
              </label>
              <div style={{ flex: 1 }}>
                <input id="product-image" type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                <label htmlFor="product-image" className="btn btn-primary" style={{ display: 'inline-block', padding: '0.7rem 1rem', borderRadius: '999px', cursor: 'pointer' }}>
                  Choose Image
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Optional
                </p>
              </div>
            </div>
          </div>

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
                className="input-field" 
                value={displayedSku}
                onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                placeholder={product ? 'SKU' : 'Auto-generated'}
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
            {product ? 'Update Product' : 'Save Product'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
