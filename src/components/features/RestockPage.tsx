import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Truck, Check, Trash2, Plus, Minus, PackagePlus } from 'lucide-react';


export const RestockPage: React.FC = () => {
  const {
    products,
    suppliers,
    recordTransaction,
    settings,
    restockCart,
    addToRestockCart,
    updateRestockQuantity,
    removeFromRestockCart,
    clearRestockCart
  } = useInventory();

  const [search, setSearch] = useState('');
  const [restockView, setRestockView] = useState<'products' | 'checkout'>('products');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );


  const handleCheckout = async () => {
    if (restockCart.length === 0) return;
    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      await Promise.all(restockCart.map(item =>
        recordTransaction({
          productId: item.product.id,
          type: 'purchase',
          quantity: item.quantity,
          amount: item.product.costPrice * item.quantity,
        })
      ));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        clearRestockCart();
        setSelectedSupplierId('');
        setIsProcessing(false);
        setRestockView('products');
      }, 1500);
    } catch (error) {
      console.error('Restock failed:', error);
      setIsProcessing(false);
    }
  };

  const cartTotal = restockCart.reduce((sum, item) => sum + (item.product.costPrice * item.quantity), 0);

  if (showSuccess) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '2rem', boxShadow: '0 0 40px rgba(244, 63, 94, 0.4)' }}
        >
          <Check size={56} strokeWidth={3} />
        </motion.div>
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '2rem', fontWeight: '800' }}>Stock Updated!</motion.h2>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              style={{ width: '100%', maxWidth: '800px', background: 'var(--bg-card)', padding: '3rem 2rem', paddingBottom: 'calc(3rem + var(--safe-bottom))', borderRadius: '32px 32px 0 0', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', boxShadow: '0 -20px 60px rgba(0,0,0,0.5)' }}
            >
              <div className="spinner" style={{ width: '60px', height: '60px', border: '5px solid rgba(244, 63, 94, 0.1)', borderTopColor: 'var(--accent-rose)', borderRadius: '50%' }} />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Processing Restock</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Increasing stock and updating capital...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {restockView === 'products' ? (
          <motion.div key="products" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>

            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <Search size={22} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search products to restock..."
                className="input-field"
                style={{ paddingLeft: '52px', height: '60px', borderRadius: '16px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.03)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredProducts.map(product => {
                const inCart = restockCart.find(item => item.product.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToRestockCart(product)}
                    className="glass-card glass-card-hover"
                    style={{
                      padding: '1.25rem',
                      textAlign: 'left',
                      border: inCart ? '2px solid var(--accent-rose)' : '1px solid var(--glass-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      width: '100%',
                      position: 'relative'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.sku}</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{ fontSize: '1.25rem', color: 'var(--accent-rose)', fontWeight: '900' }}>{settings.currency}{product.costPrice}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In Stock: {product.stock}</div>
                    </div>
                    {inCart && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--accent-rose)', color: 'white', width: '32px', height: '32px', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', boxShadow: '0 4px 15px rgba(244, 63, 94, 0.4)' }}>
                        {inCart.quantity}
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>

            {restockCart.length > 0 && (
              <motion.button
                initial={{ scale: 0, y: 100 }} animate={{ scale: 1, y: 0 }}
                onClick={() => setRestockView('checkout')}
                style={{ position: 'fixed', bottom: 'calc(1.5rem + var(--safe-bottom))', right: '1.5rem', width: '64px', height: '64px', borderRadius: '20px', background: 'var(--accent-rose)', color: 'white', border: 'none', boxShadow: '0 12px 40px rgba(244, 63, 94, 0.4)', cursor: 'pointer', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <PackagePlus size={28} strokeWidth={2.5} />
                <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'white', color: 'var(--accent-rose)', minWidth: '24px', height: '24px', padding: '0 6px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', border: '2px solid var(--accent-rose)' }}>
                  {restockCart.reduce((a, b) => a + b.quantity, 0)}
                </div>
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={() => setRestockView('products')} style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Confirm Restock</h2>
                <p style={{ color: 'var(--text-muted)' }}>Review costs for {restockCart.length} items</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '12rem' }}>
              {restockCart.map(item => (
                <div key={item.product.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)' }}>
                      <Truck size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--accent-rose)', fontWeight: '700' }}>
                        {settings.currency}{item.product.costPrice} × {item.quantity} = {settings.currency}{(item.product.costPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '4px' }}>
                      <button onClick={() => updateRestockQuantity(item.product.id, -1)} style={{ background: 'none', border: 'none', color: 'white', padding: '10px', cursor: 'pointer' }}><Minus size={18} /></button>
                      <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem' }}>{item.quantity}</span>
                      <button onClick={() => updateRestockQuantity(item.product.id, 1)} style={{ background: 'none', border: 'none', color: 'white', padding: '10px', cursor: 'pointer' }}><Plus size={18} /></button>
                    </div>
                    <button onClick={() => removeFromRestockCart(item.product.id)} style={{ background: 'rgba(244, 63, 94, 0.1)', border: 'none', color: 'var(--accent-rose)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={22} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90 }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(30, 41, 59, 0.98)', backdropFilter: 'blur(40px)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', paddingBottom: 'calc(1.5rem + var(--safe-bottom))', boxShadow: '0 -20px 40px rgba(0,0,0,0.4)', borderTopLeftRadius: '28px', borderTopRightRadius: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative', flex: 1, marginRight: '1.5rem' }}>
                    <Truck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-rose)' }} />
                    <select
                      className="input-field"
                      style={{ paddingLeft: '40px', background: 'rgba(255,255,255,0.05)', fontSize: '0.95rem', borderRadius: '14px' }}
                      value={selectedSupplierId}
                      onChange={e => setSelectedSupplierId(e.target.value)}
                    >
                      <option value="">Default Supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Total Cost</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-rose)' }}>{settings.currency}{cartTotal.toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => { clearRestockCart(); setRestockView('products'); }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '1.1rem', borderRadius: '16px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleCheckout} className="btn btn-primary" style={{ flex: 2, padding: '1.1rem', fontSize: '1.1rem', borderRadius: '16px', justifyContent: 'center', background: 'var(--accent-rose)' }}>
                    Confirm Restock
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
