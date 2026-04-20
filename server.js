import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;
const SECRET_KEY = 'inventory-pro-secret'; // In production, use env variable

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Database setup
const db = new Database('inventory.db');

// Initialize tables with User ID support
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    businessName TEXT DEFAULT 'New Business'
  );

  CREATE TABLE IF NOT EXISTS settings (
    userId TEXT PRIMARY KEY,
    businessName TEXT DEFAULT 'My Business',
    currency TEXT DEFAULT '$',
    lowStockThreshold INTEGER DEFAULT 10,
    initialCapital INTEGER DEFAULT 5000,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    costPrice REAL DEFAULT 0,
    sellingPrice REAL DEFAULT 0,
    categoryId TEXT,
    supplierId TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(categoryId) REFERENCES categories(id),
    FOREIGN KEY(supplierId) REFERENCES suppliers(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT,
    productId TEXT,
    customerId TEXT,
    type TEXT CHECK(type IN ('sale', 'purchase')),
    quantity INTEGER,
    amount REAL,
    date TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(productId) REFERENCES products(id),
    FOREIGN KEY(customerId) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS debts (
    id TEXT PRIMARY KEY,
    userId TEXT,
    personName TEXT NOT NULL,
    amount REAL DEFAULT 0,
    type TEXT CHECK(type IN ('to_pay', 'to_receive')),
    status TEXT DEFAULT 'pending',
    date TEXT,
    dueDate TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password, businessName } = req.body;
  const id = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const stmt = db.prepare('INSERT INTO users (id, username, password, businessName) VALUES (?, ?, ?, ?)');
    stmt.run(id, username, hashedPassword, businessName);
    
    // Create initial settings
    db.prepare('INSERT INTO settings (userId, businessName) VALUES (?, ?)').run(id, businessName);
    
    const token = jwt.sign({ id, username }, SECRET_KEY);
    res.json({ token, user: { id, username, businessName } });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
  res.json({ token, user: { id: user.id, username: user.username, businessName: user.businessName } });
});

app.post('/api/auth/guest', async (req, res) => {
  try {
    const id = `guest_${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7)}`;
    const username = `guest_${Math.floor(Math.random() * 10000)}`;
    const businessName = 'Guest Shop';
    
    // Create guest user
    db.prepare('INSERT INTO users (id, username, password, businessName) VALUES (?, ?, ?, ?)').run(id, username, 'guest_nopass', businessName);
    
    // Initial settings
    db.prepare('INSERT INTO settings (userId, businessName) VALUES (?, ?)').run(id, businessName);
    
    const token = jwt.sign({ id, username }, SECRET_KEY);
    res.json({ token, user: { id, username, businessName } });
  } catch (err) {
    console.error('Guest Login Error:', err);
    res.status(500).json({ error: 'Could not create guest session', details: err.message });
  }
});

// App Routes (Protected)
app.get('/api/settings', auth, (req, res) => {
  const settings = db.prepare('SELECT * FROM settings WHERE userId = ?').get(req.user.id);
  res.json(settings);
});

app.patch('/api/settings', auth, (req, res) => {
  const { businessName, currency, lowStockThreshold, initialCapital } = req.body;
  const stmt = db.prepare(`
    UPDATE settings 
    SET businessName = COALESCE(?, businessName),
        currency = COALESCE(?, currency),
        lowStockThreshold = COALESCE(?, lowStockThreshold),
        initialCapital = COALESCE(?, initialCapital)
    WHERE userId = ?
  `);
  stmt.run(businessName, currency, lowStockThreshold, initialCapital, req.user.id);
  res.json({ success: true });
});

app.get('/api/products', auth, (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE userId = ?').all(req.user.id);
  res.json(products);
});

app.post('/api/products', auth, (req, res) => {
  const { id, name, sku, stock, costPrice, sellingPrice, categoryId, supplierId } = req.body;
  const stmt = db.prepare('INSERT INTO products (id, userId, name, sku, stock, costPrice, sellingPrice, categoryId, supplierId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, req.user.id, name, sku, stock, costPrice, sellingPrice, categoryId, supplierId);
  res.json({ success: true });
});

// Categories
app.get('/api/categories', auth, (req, res) => {
  const categories = db.prepare('SELECT * FROM categories WHERE userId = ?').all(req.user.id);
  res.json(categories);
});

app.post('/api/categories', auth, (req, res) => {
  const { id, name } = req.body;
  db.prepare('INSERT INTO categories (id, userId, name) VALUES (?, ?, ?)').run(id, req.user.id, name);
  res.json({ success: true });
});

// Suppliers
app.get('/api/suppliers', auth, (req, res) => {
  const suppliers = db.prepare('SELECT * FROM suppliers WHERE userId = ?').all(req.user.id);
  res.json(suppliers);
});

app.post('/api/suppliers', auth, (req, res) => {
  const { id, name, contact, email } = req.body;
  db.prepare('INSERT INTO suppliers (id, userId, name, contact, email) VALUES (?, ?, ?, ?, ?)').run(id, req.user.id, name, contact, email);
  res.json({ success: true });
});

// Customers
app.get('/api/customers', auth, (req, res) => {
  const customers = db.prepare('SELECT * FROM customers WHERE userId = ?').all(req.user.id);
  res.json(customers);
});

app.post('/api/customers', auth, (req, res) => {
  const { id, name, contact, email } = req.body;
  db.prepare('INSERT INTO customers (id, userId, name, contact, email) VALUES (?, ?, ?, ?, ?)').run(id, req.user.id, name, contact, email);
  res.json({ success: true });
});

app.patch('/api/products/:id', auth, (req, res) => {
  const { stock, name, sellingPrice, costPrice } = req.body;
  const stmt = db.prepare(`
    UPDATE products 
    SET stock = COALESCE(?, stock),
        name = COALESCE(?, name),
        sellingPrice = COALESCE(?, sellingPrice),
        costPrice = COALESCE(?, costPrice)
    WHERE id = ? AND userId = ?
  `);
  stmt.run(stock, name, sellingPrice, costPrice, req.params.id, req.user.id);
  res.json({ success: true });
});

app.delete('/api/products/:id', auth, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

app.get('/api/transactions', auth, (req, res) => {
  const transactions = db.prepare('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC').all(req.user.id);
  res.json(transactions);
});

app.post('/api/transactions', auth, (req, res) => {
  const { id, productId, customerId, type, quantity, amount, date } = req.body;
  const stmt = db.prepare('INSERT INTO transactions (id, userId, productId, customerId, type, quantity, amount, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, req.user.id, productId, customerId, type, quantity, amount, date);
  res.json({ success: true });
});

// Debts
app.get('/api/debts', auth, (req, res) => {
  const debts = db.prepare('SELECT * FROM debts WHERE userId = ?').all(req.user.id);
  res.json(debts);
});

app.post('/api/debts', auth, (req, res) => {
  const { id, personName, amount, type, date, dueDate } = req.body;
  const stmt = db.prepare('INSERT INTO debts (id, userId, personName, amount, type, status, date, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, req.user.id, personName, amount, type, 'pending', date, dueDate);
  res.json({ success: true });
});

app.patch('/api/debts/:id', auth, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE debts SET status = ? WHERE id = ? AND userId = ?').run(status, req.params.id, req.user.id);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Inventory Multi-User Server running at http://localhost:${port}`);
});
