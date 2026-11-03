-- SheaMart Order Tracking Module
-- Sprint 3 Database Development
-- USER and PRODUCT tables with sample data (Priya)

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    delivery_address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL CHECK (price > 0),
    stock_level INTEGER NOT NULL DEFAULT 0 CHECK (stock_level >= 0),
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Sample users (passwords are placeholders, real ones will be hashed with bcrypt)
INSERT INTO users (full_name, email, phone, password_hash, role, delivery_address) VALUES
('Admin User', 'admin@sheamart.com', '0400 000 001', 'demo_hash_admin', 'admin', NULL),
('Customer A', 'customer.a@example.com', '0400 000 002', 'demo_hash_1', 'customer', '12 George St, Sydney NSW 2000'),
('Customer B', 'customer.b@example.com', '0400 000 003', 'demo_hash_2', 'customer', '45 Smith St, Parramatta NSW 2150'),
('Customer C', 'customer.c@example.com', '0400 000 004', 'demo_hash_3', 'customer', '8 King St, Newtown NSW 2042');

-- Sample products
INSERT INTO products (product_name, category, price, stock_level, description) VALUES
('Raw Shea Butter 250g', 'Body Care', 18.95, 50, 'Unrefined shea butter for skin and hair'),
('Whipped Shea Body Cream', 'Body Care', 24.50, 35, 'Light whipped cream with shea and coconut oil'),
('Shea Butter Lip Balm', 'Lip Care', 6.95, 120, 'Moisturising lip balm with natural shea'),
('Shea and Argan Hair Mask', 'Hair Care', 22.00, 20, 'Deep conditioning mask for dry hair'),
('African Black Soap', 'Cleansing', 9.95, 60, 'Traditional soap made with shea butter');

-- Display sample data
SELECT * FROM users;
SELECT * FROM products;
