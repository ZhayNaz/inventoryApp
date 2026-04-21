import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  signOut
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

  const guestLogin = async () => {
    await signInAnonymously(auth);
  };

  const login = async (email: string, pass: string) => {
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass.trim());
    } catch (err: any) {
      console.error("Firebase Login Error:", err.code, err.message);
      setIsLoggingIn(false);
      throw err;
    }
  };

  const register = async (email: string, pass: string, businessName: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass.trim());
      
      // 1. Send verification link (Our "OTP" equivalent)
      await sendEmailVerification(res.user);
      
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
    } catch (err: any) {
      console.error("Firebase Register Error:", err.code, err.message);
      throw err;
    }
  };

  const upgradeAccount = async (email: string, pass: string) => {
    if (!auth.currentUser) throw new Error("No active guest session");
    const credential = EmailAuthProvider.credential(email.trim(), pass.trim());
    await linkWithCredential(auth.currentUser, credential);
  };

  const logout = async () => {
    setIsLoggingOut(true);
    // Brief delay to show logout screen before clearing state
    setTimeout(async () => {
      await signOut(auth);
      setUser(null);
      setProducts([]);
      setTransactions([]);
      setCategories([]);
      setSuppliers([]);
      setCustomers([]);
      setDebts([]);
      setActiveTab('dashboard');
      setIsLoggingOut(false);
    }, 1500);
  };

  // HELPER: Sync entire state to Firestore
  const syncToCloud = async (updates: any) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.id), updates);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggingIn(true);
        const userRef = doc(db, 'users', firebaseUser.uid);
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
  const sanitize = (obj: any) => {
    const clean = { ...obj };
    Object.keys(clean).forEach(k => clean[k] === undefined && delete clean[k]);
    return clean;
  };

  // CRUD OPERATIONS (Arrays)
  const addProduct = async (p: Omit<Product, 'id'>) => {
    const newP = { ...sanitize(p), id: Date.now().toString() };
    await syncToCloud({ products: [...products, newP] });
  };

  const updateProduct = async (id: string, u: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...sanitize(u) } : p);
    await syncToCloud({ products: updated });
  };

  const deleteProduct = async (id: string) => {
    await syncToCloud({ products: products.filter(p => p.id !== id) });
  };

  const addCategory = async (name: string) => {
    const newC = { id: Date.now().toString(), name };
    await syncToCloud({ categories: [...categories, newC] });
  };

  const addSupplier = async (s: Omit<Supplier, 'id'>) => {
    const newS = { ...sanitize(s), id: Date.now().toString() };
    await syncToCloud({ suppliers: [...suppliers, newS] });
  };

  const addCustomer = async (c: Omit<Customer, 'id'>) => {
    const newC = { ...sanitize(c), id: Date.now().toString() };
    await syncToCloud({ customers: [...customers, newC] });
  };

  const addDebt = async (d: Omit<Debt, 'id' | 'status'>) => {
    const newD = { ...sanitize(d), id: Date.now().toString(), status: 'pending' };
    await syncToCloud({ debts: [...debts, newD] });
  };

  const updateDebtStatus = async (id: string, status: 'pending' | 'paid') => {
    await syncToCloud({ debts: debts.map(d => d.id === id ? { ...d, status } : d) });
  };

  const recordTransaction = async (t: Omit<Transaction, 'id' | 'date'>) => {
    const newT = { ...sanitize(t), id: Date.now().toString(), date: new Date().toISOString() };
    const newTransactions = [newT, ...transactions];
    
    // Update stock automatically
    const updatedProducts = products.map(p => {
      if (p.id === t.productId) {
        const stockChange = t.type === 'sale' ? -t.quantity : t.quantity;
        return { ...p, stock: p.stock + stockChange };
      }
      return p;
    });

    await syncToCloud({ 
      transactions: newTransactions,
      products: updatedProducts
    });
  };

  const updateSettings = async (u: Partial<BusinessSettings>) => {
    await syncToCloud({ settings: { ...settings, ...sanitize(u) } });
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
  
  const totalProfit = totalSales - totalCostOfSales;
  const totalCapital = settings.initialCapital + totalProfit;

  return (
    <InventoryContext.Provider value={{ 
      user, products, transactions, categories, suppliers, customers, debts, settings, 
      login, register, guestLogin, upgradeAccount, logout, addProduct, updateProduct, deleteProduct, 
      addCategory, addSupplier, addCustomer, addDebt, updateDebtStatus, recordTransaction,
      updateSettings, clearAllData, clearCache, totalCapital, totalSales, totalProfit, inventoryValue, loading,
      isLoggingIn, isLoggingOut,
      activeTab, setActiveTab
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
};
