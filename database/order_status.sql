
-- SheaMart Order Tracking Module
-- Sprint 3 Database Development

CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    order_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_status (
    status_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Sample orders
INSERT INTO orders VALUES
(1, 'Customer A', '2026-10-10'),
(2, 'Customer B', '2026-10-11'),
(3, 'Customer C', '2026-10-12');

-- Sample order statuses
INSERT INTO order_status
(order_id, status, remarks)
VALUES
(1, 'Pending', 'Order received'),
(2, 'Processing', 'Preparing order'),
(3, 'Shipped', 'Order dispatched');

-- Display sample data
SELECT * FROM order_status;
