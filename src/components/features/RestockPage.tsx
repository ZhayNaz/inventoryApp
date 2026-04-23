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
      await Promise.all(restockCart.map(item =>
        recordTransaction({
          productId: item.product.id,
          type: 'purchase',
          quantity: item.quantity,
          amount: item.product.costPrice * item.quantity,
          // We could add supplierId to transaction log if needed
        })
      ));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(true);
        clearRestockCart();
        setSelectedSupplierId('');
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('Restock failed:', error);
      setIsProcessing(false);
    }
  };

  const cartTotal = restockCart.reduce((sum, item) => sum + (item.product.costPrice * item.quantity), 0);

  if (showSuccess) {
    return (
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1.5rem' }}
        >
          <Check size={48} strokeWidth={3} />
        </motion.div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Restock Successful!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Stock levels have been increased.</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '10rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Search Product to Restock</h3>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
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

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
            {filteredProducts.map(product => {
              const inCart = restockCart.find(item => item.product.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addToRestockCart(product)}
                  className="glass-card"
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    border: inCart ? '1px solid var(--accent-rose)' : '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', fontWeight: '700' }}>Cost: {settings.currency}{product.costPrice}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current: {product.stock}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {restockCart.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PackagePlus size={20} /> Restock List ({restockCart.length})
            </h3>
            <button onClick={clearRestockCart} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Clear All</button>
          </div>

          <div className="scroll-panel" style={{ maxHeight: '35vh' }}>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <AnimatePresence>
                {restockCart.map(item => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cost: {settings.currency}{item.product.costPrice}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.25rem' }}>
                        <button onClick={() => updateRestockQuantity(item.product.id, -1)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.25rem' }}><Minus size={14} /></button>
                        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                        <button onClick={() => updateRestockQuantity(item.product.id, 1)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.25rem' }}><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromRestockCart(item.product.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><Trash2 size={18} /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      <AnimatePresence>
        {restockCart.length > 0 && (
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            style={{
              position: 'fixed',
              bottom: 'calc(4.5rem + var(--safe-bottom))',
              left: 'var(--safe-left)',
              right: 'var(--safe-right)',
              padding: '1.25rem',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid var(--glass-border)',
              zIndex: 90
            }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Truck size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select
                    className="input-field"
                    style={{ paddingLeft: '40px', background: 'rgba(255,255,255,0.03)', fontSize: '0.85rem' }}
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                  >
                    <option value="">Default Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Cost</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-rose)' }}>{settings.currency}{cartTotal.toFixed(2)}</div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', background: 'var(--accent-rose)', boxShadow: '0 8px 32px rgba(244, 63, 94, 0.3)' }}
              >
                {isProcessing ? 'Processing...' : `Confirm Restock (${restockCart.length} Items)`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
