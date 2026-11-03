PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    order_date TEXT NOT NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_item (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL
        CHECK (typeof(quantity) = 'integer' AND quantity > 0),
    unit_price REAL NOT NULL CHECK (unit_price > 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    UNIQUE (order_id, product_id)
);

-- Sample orders: keep existing orders if already present
INSERT INTO orders (order_id, customer_name, order_date)
VALUES
(1, 'Customer A', '2026-10-10'),
(2, 'Customer B', '2026-10-11'),
(3, 'Customer C', '2026-10-12')
ON CONFLICT (order_id) DO NOTHING;

-- Sample items: product IDs match users_products.sql
INSERT INTO order_item
(order_id, product_id, quantity, unit_price)
VALUES
(1, 1, 2, 18.95),
(1, 3, 1, 6.95),
(2, 2, 1, 24.50),
(2, 5, 2, 9.95),
(3, 4, 1, 22.00),
(3, 3, 3, 6.95)
ON CONFLICT (order_id, product_id) DO NOTHING;

COMMIT;

-- Display sample data
SELECT * FROM orders;
SELECT * FROM order_item;
