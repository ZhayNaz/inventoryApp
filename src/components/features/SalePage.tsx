import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Check, Trash2, Plus, Minus, ShoppingBag, Loader2, ArrowRight, ArrowLeft, ShoppingCart } from 'lucide-react';

export const SalePage: React.FC = () => {
  const { 
    products, 
    customers, 
    recordTransaction, 
    settings,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    saleView,
    setSaleView
  } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    ), [products, search]
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      await Promise.all(cart.map(item => 
        recordTransaction({
          productId: item.product.id,
          type: 'sale',
          quantity: item.quantity,
          amount: item.product.sellingPrice * item.quantity,
          customerId: selectedCustomerId || undefined
        })
      ));
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        clearCart();
        setSelectedCustomerId('');
        setIsCheckingOut(false);
        setSaleView('products');
      }, 1200);
    } catch (error) {
      console.error('Checkout failed:', error);
      setIsCheckingOut(false);
    }
  };

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0),
  [cart]);

  if (showSuccess) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ scale: 0, rotate: -180 }} 
          animate={{ scale: 1, rotate: 0 }} 
          transition={{ type: 'spring', damping: 12 }}
          style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '2rem', boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)' }}
        >
          <Check size={56} strokeWidth={3} />
        </motion.div>
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '2rem', fontWeight: '800' }}>Sale Recorded!</motion.h2>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Global Processing Loader */}
      <AnimatePresence>
        {isCheckingOut && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              style={{
                width: '100%',
                maxWidth: '800px',
                background: 'var(--bg-card)',
                padding: '3rem 2rem',
                paddingBottom: 'calc(3rem + var(--safe-bottom))',
                borderRadius: '32px 32px 0 0',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.5)'
              }}
            >
              <Loader2 className="spinner" size={60} strokeWidth={2.5} style={{ color: 'var(--primary)' }} />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirming Order</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Updating records and saving locally...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {saleView === 'products' ? (
          <motion.div 
            key="products-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Storefront</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Select items to populate the current order</p>
            </div>

            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <Search size={22} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Find products by name or SKU..." 
                className="input-field" 
                style={{ paddingLeft: '52px', height: '60px', borderRadius: '16px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.03)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1.25rem' }}>
              {filteredProducts.map(product => {
                const inCart = cart.find(item => item.product.id === product.id);
                const outOfStock = product.stock <= 0;
                const maxReached = inCart && inCart.quantity >= product.stock;

                return (
                  <button 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={outOfStock || maxReached}
                    className="glass-card glass-card-hover"
                    style={{ 
                      padding: '1.25rem', 
                      textAlign: 'left', 
                      border: inCart ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                      opacity: (outOfStock || maxReached) ? 0.4 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      position: 'relative'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.sku}</div>
                    </div>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ fontSize: '1.25rem', color: 'var(--accent-emerald)', fontWeight: '900' }}>{settings.currency}{product.sellingPrice}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.stock} available</div>
                    </div>

                    {inCart && (
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.5)' }}
                      >
                        {inCart.quantity}
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>

            {cart.length > 0 && (
              <motion.button
                initial={{ scale: 0, y: 100 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 100 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSaleView('checkout')}
                style={{
                  position: 'fixed',
                  bottom: 'calc(1.5rem + var(--safe-bottom))',
                  right: '1.5rem',
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5)',
                  cursor: 'pointer',
                  zIndex: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShoppingCart size={28} strokeWidth={2.5} />
                <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent-rose)', color: 'white', minWidth: '24px', height: '24px', padding: '0 6px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(244, 63, 94, 0.4)', border: '2px solid var(--bg-dark)' }}>
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </div>
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="checkout-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                onClick={() => setSaleView('products')}
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Review Order</h2>
                <p style={{ color: 'var(--text-muted)' }}>Finalize details for {cart.length} items</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '12rem' }}>
              {cart.map(item => (
                <div 
                  key={item.product.id}
                  className="glass-card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                        {settings.currency}{item.product.sellingPrice} × {item.quantity} = {settings.currency}{(item.product.sellingPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '4px' }}>
                      <button onClick={() => updateCartQuantity(item.product.id, -1)} style={{ background: 'none', border: 'none', color: 'white', padding: '10px', cursor: 'pointer' }}><Minus size={18} /></button>
                      <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.product.id, 1)} style={{ background: 'none', border: 'none', color: 'white', padding: '10px', cursor: 'pointer' }}><Plus size={18} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'rgba(244, 63, 94, 0.1)', border: 'none', color: 'var(--accent-rose)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={22} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Checkout Bar */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90 }}>
              <div style={{ 
                maxWidth: '800px', margin: '0 auto', background: 'rgba(30, 41, 59, 0.98)', backdropFilter: 'blur(40px)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', paddingBottom: 'calc(1.5rem + var(--safe-bottom))', boxShadow: '0 -20px 40px rgba(0,0,0,0.4)', borderTopLeftRadius: '28px', borderTopRightRadius: '28px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                   <div style={{ position: 'relative', flex: 1, marginRight: '1.5rem' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <select 
                      className="input-field" 
                      style={{ paddingLeft: '40px', background: 'rgba(255,255,255,0.05)', fontSize: '0.95rem', borderRadius: '14px' }}
                      value={selectedCustomerId}
                      onChange={e => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="">Walk-in Customer</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Total</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-emerald)' }}>{settings.currency}{cartTotal.toFixed(2)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => { clearCart(); setSaleView('products'); }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '1.1rem', borderRadius: '16px', fontWeight: '700', cursor: 'pointer' }}>Cancel Order</button>
                  <button 
                    onClick={handleCheckout}
                    className="btn btn-primary" 
                    style={{ flex: 2, padding: '1.1rem', fontSize: '1.1rem', borderRadius: '16px', justifyContent: 'center' }}
                  >
                    Process Sale <ArrowRight size={22} />
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
