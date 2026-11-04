const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'sheamart.db');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) { console.error('DB error:', err.message); process.exit(1); }
  console.log('Connected to SQLite:', DB_PATH);
  initDB();
});

function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT DEFAULT 'customer', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS products (product_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, price REAL NOT NULL, stock_quantity INTEGER DEFAULT 0, category TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (order_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, total_amount REAL NOT NULL, status TEXT DEFAULT 'Pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(user_id))`);
    db.run(`CREATE TABLE IF NOT EXISTS order_items (item_id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, unit_price REAL NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(order_id), FOREIGN KEY (product_id) REFERENCES products(product_id))`);
    db.run(`CREATE TABLE IF NOT EXISTS order_status (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'Pending', remarks TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.get('SELECT COUNT(*) as cnt FROM order_status', (err, row) => {
      if (!err && row.cnt === 0) {
        db.run("INSERT INTO order_status (order_id, status, remarks) VALUES (1, 'Shipped', 'Dispatched from warehouse')");
        db.run("INSERT INTO order_status (order_id, status, remarks) VALUES (2, 'Processing', 'Payment confirmed')");
        db.run("INSERT INTO order_status (order_id, status, remarks) VALUES (3, 'Pending', 'Awaiting payment')");
      }
    });
    console.log('Database ready');
  });
}

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

app.get('/api/order-status', (req, res) => {
  db.all('SELECT * FROM order_status ORDER BY updated_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/order-status/:id', (req, res) => {
  db.get('SELECT * FROM order_status WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Record not found' });
    res.json(row);
  });
});

app.post('/api/order-status', (req, res) => {
  const { order_id, status, remarks } = req.body;
  if (!order_id || !status) return res.status(400).json({ error: 'order_id and status are required' });
  if (isNaN(Number(order_id))) return res.status(400).json({ error: 'order_id must be a number' });
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status value' });
  db.run('INSERT INTO order_status (order_id, status, remarks) VALUES (?, ?, ?)', [Number(order_id), status, remarks || ''], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) return res.status(409).json({ error: 'Order ID already exists' });
      return res.status(500).json({ error: err.message });
    }
    db.get('SELECT * FROM order_status WHERE id = ?', [this.lastID], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(row);
    });
  });
});

app.put('/api/order-status/:id', (req, res) => {
  const { status, remarks } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status value' });
  db.get('SELECT * FROM order_status WHERE id = ?', [req.params.id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    const newRemarks = remarks !== undefined ? remarks : existing.remarks;
    db.run('UPDATE order_status SET status = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, newRemarks, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM order_status WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    });
  });
});

app.delete('/api/order-status/:id', (req, res) => {
  db.get('SELECT * FROM order_status WHERE id = ?', [req.params.id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    db.run('DELETE FROM order_status WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Record deleted successfully' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`SheaMart backend running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/order-status`);
});
