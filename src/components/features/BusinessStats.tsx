import { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Briefcase, BarChart3, Plus, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BusinessStats: React.FC = () => {
  const { 
    totalCapital, 
    totalSales,
    totalProfit, 
    inventoryValue, 
    products, 
    transactions, 
    settings, 
    updateSettings 
  } = useInventory();
  
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [newCapital, setNewCapital] = useState(settings.initialCapital.toString());

  const handleUpdateCapital = async () => {
    await updateSettings({ initialCapital: parseFloat(newCapital) || 0 });
    setShowCapitalModal(false);
  };

  const lowStockCount = products.filter(p => p.stock < settings.lowStockThreshold).length;

  // Mock data for weekly trends
  const trendData = [
    { name: 'Mon', profit: totalProfit * 0.1 },
    { name: 'Tue', profit: totalProfit * 0.15 },
    { name: 'Wed', profit: totalProfit * 0.12 },
    { name: 'Thu', profit: totalProfit * 0.25 },
    { name: 'Fri', profit: totalProfit * 0.4 },
    { name: 'Sat', profit: totalProfit * 0.6 },
    { name: 'Sun', profit: totalProfit },
  ];

  return (
    <div className="fade-in">
      {/* 4 Main Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={18} />
          </div>
          <button 
            onClick={() => setShowCapitalModal(true)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
          >
            <Plus size={14} />
          </button>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Capital</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{settings.currency}{totalCapital.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={18} />
          </div>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--accent-emerald)', fontSize: '0.65rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            +8.2% <ArrowUpRight size={10} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Profit</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>{settings.currency}{totalProfit.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inv. Value</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{settings.currency}{inventoryValue.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: lowStockCount > 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--glass-border)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: lowStockCount > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)', color: lowStockCount > 0 ? 'var(--accent-rose)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {lowStockCount > 0 ? <AlertTriangle size={18} /> : <BarChart3 size={18} />}
          </div>
          {lowStockCount > 0 && (
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent-rose)', color: 'white', fontSize: '0.6rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold' }}>LO-STOCK</div>
          )}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock Items</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{products.length}</div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', height: '240px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Revenue Trend</h3>
          <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{settings.currency}{totalSales.toFixed(0)}</div>
        </div>
        <ResponsiveContainer width="100%" height={160} minHeight={160}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="profit" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity Mini List */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Recent Operations</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {transactions.slice(0, 5).map(tx => {
            const product = products.find(p => p.id === tx.productId);
            return (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: tx.type === 'sale' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    color: tx.type === 'sale' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {tx.type === 'sale' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{product?.name || 'Item'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{tx.type === 'sale' ? 'Sold' : 'Purchased'} • {tx.quantity} units</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', color: tx.type === 'sale' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {tx.type === 'sale' ? '+' : '-'}{settings.currency}{tx.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No activities found</p>}
        </div>
      </div>

      {/* Capital Modal */}
      <AnimatePresence>
        {showCapitalModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCapitalModal(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ position: 'fixed', top: '20%', left: '1.25rem', right: '1.25rem', zIndex: 201 }}
            >
              <div className="glass-card" style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Update Business Capital</h2>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Initial Capital ({settings.currency})</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={newCapital} 
                    onChange={(e) => setNewCapital(e.target.value)}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setShowCapitalModal(false)} className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
                  <button onClick={handleUpdateCapital} className="btn btn-primary">Update</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
