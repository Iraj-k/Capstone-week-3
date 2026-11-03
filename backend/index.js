const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — allow frontend to call backend
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serve frontend and root files
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.static(path.join(__dirname, '..')));

// Database setup
const DB_PATH = path.join(__dirname, '..', 'database', 'sheamart.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database:', DB_PATH);
  initDB();
});

function initDB() {
  db.serialize(() => {
    // Create all tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock_quantity INTEGER DEFAULT 0,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS order_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'Pending',
      remarks TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed demo data if empty
    db.get('SELECT COUNT(*) as cnt FROM order_status', (err, row) => {
      if (!err && row.cnt === 0) {
        db.run("INSERT INTO order_status (order_id, status, remarks) VALUES (1, 'Shipped', 'Dispatched from warehouse')");
        db.run("INSERT INTO order_status (order_id, status, remarks) VALUES (2, 'Processing', 'Payment confirmed')");
        db.run("INSERT INTO order_status (order_id, status, remarks) VALUES (3, 'Pending', 'Awaiting payment')");
        console.log('Seeded 3 demo order_status records');
      }
    });

    console.log('Database tables ready');
  });
}

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// ─── ORDER STATUS CRUD ENDPOINTS ────────────────────────────────────────────

// GET all
app.get('/api/order-status', (req, res) => {
  db.all('SELECT * FROM order_status ORDER BY updated_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET by id
app.get('/api/order-status/:id', (req, res) => {
  db.get('SELECT * FROM order_status WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Record not found' });
    res.json(row);
  });
});

// POST create
app.post('/api/order-status', (req, res) => {
  const { order_id, status, remarks } = req.body;

  if (!order_id || !status) {
    return res.status(400).json({ error: 'order_id and status are required' });
  }
  if (isNaN(Number(order_id))) {
    return res.status(400).json({ error: 'order_id must be a number' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const sql = 'INSERT INTO order_status (order_id, status, remarks) VALUES (?, ?, ?)';
  db.run(sql, [Number(order_id), status, remarks || ''], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Order ID already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    db.get('SELECT * FROM order_status WHERE id = ?', [this.lastID], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(row);
    });
  });
});

// PUT update
app.put('/api/order-status/:id', (req, res) => {
  const { status, remarks } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  db.get('SELECT * FROM order_status WHERE id = ?', [req.params.id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!existing) return res.status(404).json({ error: 'Record not found' });

    const newRemarks = remarks !== undefined ? remarks : existing.remarks;
    const sql = 'UPDATE order_status SET status = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, [status, newRemarks, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM order_status WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    });
  });
});

// DELETE
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

// Start server
app.listen(PORT, () => {
  console.log(`\nSheaMart backend running at http://localhost:${PORT}`);
  console.log(`Order Status API: http://localhost:${PORT}/api/order-status\n`);
});
