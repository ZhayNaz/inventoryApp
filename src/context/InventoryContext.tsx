import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  signOut,
  type ActionCodeSettings
} from 'firebase/auth';
import { 
  terminate,
  clearIndexedDbPersistence,
  onSnapshot,
  doc, 
  setDoc, 
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// TYPES
export interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  imageUrl?: string;
  categoryId?: string;
  supplierId?: string;
}

export interface Transaction {
  id: string;
  type: 'sale' | 'purchase';
  productId: string;
  quantity: number;
  amount: number;
  date: string;
  customerId?: string;
}

export interface Category { id: string; name: string; }
export interface Supplier { id: string; name: string; contact: string; category: string; }
export interface Customer { id: string; name: string; phone: string; debt: number; }
export interface Debt { id: string; customerId: string; amount: number; reason: string; status: 'pending' | 'paid'; dueDate: string; }

export interface BusinessSettings {
  businessName: string;
  currency: string;
  lowStockThreshold: number;
  initialCapital: number;
  theme: 'dark' | 'light';
}

interface User {
  id: string;
  username: string;
  businessName: string;
  setupComplete: boolean;
  isGuest: boolean;
}

interface InventoryContextType {
  user: User | null;
  products: Product[];
  transactions: Transaction[];
  categories: Category[];
  suppliers: Supplier[];
  customers: Customer[];
  debts: Debt[];
  settings: BusinessSettings;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string, b: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  upgradeAccount: (e: string, p: string) => Promise<void>;
  logout: () => void;
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, u: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (n: string) => Promise<void>;
  addSupplier: (s: Omit<Supplier, 'id'>) => Promise<void>;
  addCustomer: (c: Omit<Customer, 'id'>) => Promise<void>;
  addDebt: (d: Omit<Debt, 'id' | 'status'>) => Promise<void>;
  updateDebtStatus: (id: string, s: 'pending' | 'paid') => Promise<void>;
  recordTransaction: (t: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  updateSettings: (u: Partial<BusinessSettings>) => Promise<void>;
  clearAllData: () => Promise<void>;
  clearCache: () => Promise<void>;
  totalCapital: number;
  totalSales: number;
  totalProfit: number;
  inventoryValue: number;
  loading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  activeTab: string;
  setActiveTab: (t: string) => void;
  saleView: 'products' | 'checkout';
  setSaleView: (v: 'products' | 'checkout') => void;
  cart: { product: Product; quantity: number }[];
  addToCart: (p: Product) => void;
  updateCartQuantity: (id: string, d: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  restockCart: { product: Product; quantity: number }[];
  addToRestockCart: (p: Product) => void;
  updateRestockQuantity: (id: string, d: number) => void;
  removeFromRestockCart: (id: string) => void;
  clearRestockCart: () => void;
  syncAllToCloud: () => Promise<void>;
  lastSynced: string | null;
  completeOnboarding: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: 'My Business',
    currency: '₱',
    lowStockThreshold: 5,
    initialCapital: 0,
    theme: 'dark'
  });

  const [saleView, setSaleView] = useState<'products' | 'checkout'>('products');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [restockCart, setRestockCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isInitialSyncComplete, setIsInitialSyncComplete] = useState(false);

  const productsRef = useRef(products);
  const transactionsRef = useRef(transactions);
  const categoriesRef = useRef(categories);
  const suppliersRef = useRef(suppliers);
  const customersRef = useRef(customers);
  const debtsRef = useRef(debts);
  const settingsRef = useRef(settings);
  const userRef = useRef(user);

  useEffect(() => { productsRef.current = products; }, [products]);
  useEffect(() => { transactionsRef.current = transactions; }, [transactions]);
  useEffect(() => { categoriesRef.current = categories; }, [categories]);
  useEffect(() => { suppliersRef.current = suppliers; }, [suppliers]);
  useEffect(() => { customersRef.current = customers; }, [customers]);
  useEffect(() => { debtsRef.current = debts; }, [debts]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { userRef.current = user; }, [user]);

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

  const updateCartQuantity = (productId: string, delta: number) => {
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

  const clearCart = () => setCart([]);

  const addToRestockCart = (product: Product) => {
    setRestockCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateRestockQuantity = (productId: string, delta: number) => {
    setRestockCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromRestockCart = (productId: string) => {
    setRestockCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearRestockCart = () => setRestockCart([]);

  const completeOnboarding = async () => {
    if (!user) return;
    const updatedUser = { ...user, setupComplete: true };
    setUser(updatedUser);
    
    // Sync to cloud immediately
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, { setupComplete: true });
  };

  const guestLogin = async () => {
    await signInAnonymously(auth);
  };

  const getEmailVerificationSettings = (): ActionCodeSettings => ({
    url: `${window.location.origin}/?emailVerified=1`,
    handleCodeInApp: false,
  });

  const login = async (email: string, pass: string) => {
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass.trim());
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error("Firebase Login Error:", error.code, error.message);
      setIsLoggingIn(false);
      throw err;
    }
  };

  const register = async (email: string, pass: string, businessName: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass.trim());
      
      // 1. Send verification link (Our "OTP" equivalent)
      await sendEmailVerification(res.user, getEmailVerificationSettings());
      
      // 2. Create the profile
      await setDoc(doc(db, 'users', res.user.uid), {
        businessName,
        setupComplete: false,
        products: [],
        transactions: [],
        categories: [],
        suppliers: [],
        customers: [],
        debts: [],
        settings: {
          businessName,
          currency: '₱',
          lowStockThreshold: 5,
          initialCapital: 0,
          theme: 'dark'
        }
      });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error("Firebase Register Error:", error.code, error.message);
      throw err;
    }
  };

  const upgradeAccount = async (email: string, pass: string) => {
    if (!auth.currentUser) throw new Error("No active guest session");
    const credential = EmailAuthProvider.credential(email.trim(), pass.trim());
    await linkWithCredential(auth.currentUser, credential);

    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser, getEmailVerificationSettings());
      await auth.currentUser.reload();
    }

    await syncAllToCloud();
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      // 1. Give the user a moment to see the "Logging out" animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 2. Perform the final cloud sync
      await syncAllToCloud();
      
      // 3. Sign out of Firebase
      await signOut(auth);
      
      // 4. Clear local state
      setUser(null);
      setProducts([]);
      setTransactions([]);
      setCategories([]);
      setSuppliers([]);
      setCustomers([]);
      setDebts([]);
      setCart([]);
      setRestockCart([]);
      setActiveTab('dashboard');
      
      // Clear localStorage cache for the specific user
      if (user) {
        localStorage.removeItem(`inventory_data_${user.id}`);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // PERSISTENCE HELPERS
  useEffect(() => {
    if (!user) return;
    const localData = {
      products, transactions, categories, suppliers, customers, debts, settings
    };
    localStorage.setItem(`inventory_data_${user.id}`, JSON.stringify(localData));
  }, [user, products, transactions, categories, suppliers, customers, debts, settings]);

  // NEW: Sync everything to cloud in one batch
  const syncAllToCloud = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser || !isInitialSyncComplete) return;
    try {
      console.log("Starting batch sync to cloud...");
      const userDocRef = doc(db, 'users', currentUser.id);
      await updateDoc(userDocRef, {
        products: productsRef.current,
        transactions: transactionsRef.current,
        categories: categoriesRef.current,
        suppliers: suppliersRef.current,
        customers: customersRef.current,
        debts: debtsRef.current,
        settings: settingsRef.current,
        setupComplete: currentUser.setupComplete
      });
      setLastSynced(new Date().toLocaleTimeString());
      console.log("Batch sync successful.");
    } catch (err) {
      console.error("Batch sync failed:", err);
    }
  }, [isInitialSyncComplete]);

  // Sync on app close
  useEffect(() => {
    const handleBeforeUnload = () => {
      void syncAllToCloud();
      // Most browsers don't wait for async calls in beforeunload,
      // but firestore will try to sync in background if persistence is on.
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncAllToCloud]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggingIn(true);
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Try to load from localStorage first for immediate UI
        const saved = localStorage.getItem(`inventory_data_${firebaseUser.uid}`);
        if (saved) {
          const data = JSON.parse(saved);
          setProducts(data.products || []);
          setTransactions(data.transactions || []);
          setCategories(data.categories || []);
          setSuppliers(data.suppliers || []);
          setCustomers(data.customers || []);
          setDebts(data.debts || []);
          setSettings(prev => data.settings || prev);
        }

        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProducts(data.products || []);
            setTransactions(data.transactions || []);
            setCategories(data.categories || []);
            setSuppliers(data.suppliers || []);
            setCustomers(data.customers || []);
            setDebts(data.debts || []);
            setSettings(data.settings || {
              businessName: data.businessName || 'My Business',
              currency: '₱',
              lowStockThreshold: 5,
              initialCapital: 0,
              theme: 'dark'
            });
            setUser({
              id: firebaseUser.uid,
              username: firebaseUser.isAnonymous ? 'Guest User' : (firebaseUser.email?.split('@')[0] || 'User'),
              businessName: data.settings?.businessName || data.businessName || 'My Business',
              setupComplete: data.setupComplete ?? true,
              isGuest: firebaseUser.isAnonymous
            });
            setIsInitialSyncComplete(true);
            setIsLoggingIn(false);
          } else {
            setDoc(userRef, {
              businessName: 'My Business',
              products: [],
              transactions: [],
              categories: [],
              suppliers: [],
              customers: [],
              debts: [],
              settings: {
                businessName: 'My Business',
                currency: '₱',
                lowStockThreshold: 5,
                initialCapital: 0,
                theme: 'dark'
              }
            });
          }
          setLoading(false);
        }, () => {
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // SANITIZE HELPER
  const sanitize = <T extends Record<string, unknown>>(obj: T): T => {
    const clean = { ...obj } as Record<string, unknown>;
    Object.keys(clean).forEach(k => clean[k] === undefined && delete clean[k]);
    return clean as T;
  };

  // CRUD OPERATIONS (Arrays)
  const addProduct = async (p: Omit<Product, 'id'>) => {
    const newP = { ...sanitize(p), id: Date.now().toString() };
    setProducts(prev => [...prev, newP]);
    setTimeout(syncAllToCloud, 0);
  };

  const updateProduct = async (id: string, u: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...sanitize(u) } : p));
    setTimeout(syncAllToCloud, 0);
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setTimeout(syncAllToCloud, 0);
  };

  const addCategory = async (name: string) => {
    const newC = { id: Date.now().toString(), name };
    setCategories(prev => [...prev, newC]);
    setTimeout(syncAllToCloud, 0);
  };

  const addSupplier = async (s: Omit<Supplier, 'id'>) => {
    const newS = { ...sanitize(s), id: Date.now().toString() };
    setSuppliers(prev => [...prev, newS]);
    setTimeout(syncAllToCloud, 0);
  };

  const addCustomer = async (c: Omit<Customer, 'id'>) => {
    const newC = { ...sanitize(c), id: Date.now().toString() };
    setCustomers(prev => [...prev, newC]);
    setTimeout(syncAllToCloud, 0);
  };

  const addDebt = async (d: Omit<Debt, 'id' | 'status'>) => {
    const newD: Debt = { ...sanitize(d), id: Date.now().toString(), status: 'pending' };
    setDebts(prev => [...prev, newD]);
    setTimeout(syncAllToCloud, 0);
  };

  const updateDebtStatus = async (id: string, status: 'pending' | 'paid') => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    setTimeout(syncAllToCloud, 0);
  };

  const recordTransaction = async (t: Omit<Transaction, 'id' | 'date'>) => {
    const newT = { ...sanitize(t), id: Date.now().toString(), date: new Date().toISOString() };
    setTransactions(prev => [newT, ...prev]);
    
    // Update stock automatically
    setProducts(prev => prev.map(p => {
      if (p.id === t.productId) {
        const stockChange = t.type === 'sale' ? -t.quantity : t.quantity;
        return { ...p, stock: p.stock + stockChange };
      }
      return p;
    }));

    // AUTO-SYNC TO CLOUD
    setTimeout(syncAllToCloud, 0);
  };

  const updateSettings = async (u: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...sanitize(u) }));
    // For settings, we sync immediately so theme changes are reflected across devices
    setTimeout(syncAllToCloud, 0);
  };

  const clearAllData = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.id), {
      products: [],
      transactions: [],
      debts: []
    });
  };

  const clearCache = async () => {
    try {
      await terminate(db);
      await clearIndexedDbPersistence(db);
      window.location.reload();
    } catch (err) {
      console.error("Clear cache failed:", err);
      window.location.reload(); // Fallback to reload
    }
  };

  // CALCULATIONS
  const inventoryValue = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const totalSales = transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
  const totalCostOfSales = transactions.filter(t => t.type === 'sale').reduce((acc, t) => {
    const p = products.find(prod => prod.id === t.productId);
    return acc + (t.quantity * (p?.costPrice || 0));
  }, 0);
  
  const totalPurchases = transactions.filter(t => t.type === 'purchase').reduce((acc, t) => acc + t.amount, 0);
  const totalProfit = totalSales - totalCostOfSales;
  const totalCapital = settings.initialCapital + totalSales - totalPurchases;

  return (
    <InventoryContext.Provider value={{ 
      user, products, transactions, categories, suppliers, customers, debts, settings, 
      login, register, guestLogin, upgradeAccount, logout, addProduct, updateProduct, deleteProduct, 
      addCategory, addSupplier, addCustomer, addDebt, updateDebtStatus, recordTransaction,
      updateSettings, clearAllData, clearCache, totalCapital, totalSales, totalProfit, inventoryValue, loading,
      isLoggingIn, isLoggingOut,
      activeTab, setActiveTab,
      saleView, setSaleView,
      cart, addToCart, updateCartQuantity, removeFromCart, clearCart,
      restockCart, addToRestockCart, updateRestockQuantity, removeFromRestockCart, clearRestockCart,
      syncAllToCloud, lastSynced,
      completeOnboarding
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
};
