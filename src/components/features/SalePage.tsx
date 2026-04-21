import React, { useState } from 'react';
import { useInventory, type Product } from '../../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Check, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export const SalePage: React.FC = () => {
  const { products, customers, recordTransaction, settings } = useInventory();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, Math.min(item.product.stock, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      // Record all transactions
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
        setCart([]);
        setSelectedCustomerId('');
        setIsCheckingOut(false);
      }, 2000);
    } catch (error) {
      console.error('Checkout failed:', error);
      setIsCheckingOut(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);

  if (showSuccess) {
    return (
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1.5rem' }}
        >
          <Check size={48} strokeWidth={3} />
        </motion.div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sale Completed!</h2>
        <p style={{ color: 'var(--text-muted)' }}>{cart.length} items processed successfully.</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '10rem' }}>
      {/* Product Selection Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Add Items to Cart</h3>
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
              const inCart = cart.find(item => item.product.id === product.id);
              return (
                <button 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0 || (inCart && inCart.quantity >= product.stock)}
                  className="glass-card"
                  style={{ 
                    padding: '0.75rem', 
                    textAlign: 'center', 
                    border: inCart ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                    opacity: (product.stock <= 0 || (inCart && inCart.quantity >= product.stock)) ? 0.5 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>{settings.currency}{product.sellingPrice}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>In Stock: {product.stock}</div>
                  {inCart && (
                    <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {inCart.quantity}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Summary Header */}
      {cart.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} /> Current Cart ({cart.length})
            </h3>
            <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>Clear All</button>
          </div>

          <div className="scroll-panel" style={{ maxHeight: '35vh' }}>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div 
                    key={item.product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{settings.currency}{item.product.sellingPrice} per unit</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.25rem' }}>
                        <button onClick={() => updateQuantity(item.product.id, -1)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.25rem' }}><Minus size={14} /></button>
                        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} style={{ background: 'none', border: 'none', color: 'white', padding: '0.25rem' }}><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><Trash2 size={18} /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Floating Checkout Bar */}
      <AnimatePresence>
        {cart.length > 0 && (
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
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select 
                    className="input-field" 
                    style={{ paddingLeft: '40px', background: 'rgba(255,255,255,0.03)', fontSize: '0.85rem' }}
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                  >
                    <option value="">Walk-in Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>{settings.currency}{cartTotal.toFixed(2)}</div>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', background: 'var(--accent-emerald)', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)' }}
              >
                {isCheckingOut ? 'Processing...' : `Sell ${cart.length} ${cart.length === 1 ? 'Item' : 'Items'}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
