 Week 2 — Data Analysis
SheaMart — Order Tracking Module

---

Activity 1 — Module Data Discovery

The following data items were identified for the Order Tracking module:

1. Order ID
2. Customer Name
3. Customer Email
4. Customer Phone Number
5. Delivery Address
6. Order Status
7. Order Date & Time
8. Last Updated Timestamp
9. Product ID
10. Product Name
11. Product Price
12. Product Category
13. Stock Level
14. Quantity Ordered
15. Total Price
16. Payment Status
17. Admin ID
18. Shipping Date
19. Tracking Number
20. Estimated Delivery Date

---

Activity 2 — Project Data Inventory

| Data Item | Purpose | Who Creates It? | Who Uses It? | Required? |
|---|---|---|---|---|
| Order ID | Uniquely identifies each order | System (auto-generated) | Customer, Admin | Yes |
| Customer Name | Identifies who placed the order | Customer (registration) | Admin | Yes |
| Customer Email | Used for login and notifications | Customer | System, Admin | Yes |
| Customer Phone Number | Contact number for delivery | Customer | Admin, Courier | Yes |
| Delivery Address | Where the order needs to be sent | Customer | Admin, Courier | Yes |
| Order Status | Shows current stage of the order | Admin (updates it) | Customer | Yes |
| Order Date & Time | Records when the order was placed | System (auto-generated) | Customer, Admin | Yes |
| Last Updated Timestamp | Records when status last changed | System (auto-generated) | Customer, Admin | Yes |
| Product ID | Uniquely identifies each product | Administrator | Customer, Admin | Yes |
| Product Name | Identifies the product by name | Administrator | Customer | Yes |
| Product Price | Stores the price of the product | Administrator | Customer | Yes |
| Product Category | Groups products into categories | Administrator | Customer | Yes |
| Stock Level | Shows how many items are available | Administrator | Admin | Yes |
| Quantity Ordered | Records how many items were ordered | Customer (cart) | Admin | Yes |
| Total Price | Amount charged for the order | System (calculated) | Customer, Admin | Yes |
| Payment Status | Whether the order has been paid | System | Admin | Yes |
| Admin ID | Records which admin updated status | Admin (login session) | System | Yes |
| Shipping Date | Date the order was shipped | Admin | Customer | Yes |
| Tracking Number | External courier tracking reference | System / Courier | Customer | No |
| Estimated Delivery Date | Predicted arrival date | System (calculated) | Customer | No |

---

Activity 3 — Data Flow Investigation

How information moves through the Order Tracking module:

Customer
↓ (registers and logs in)
Authentication System
↓ (verified with bcrypt + JWT)
Product Catalogue
↓ (customer selects items)
Shopping Cart
↓ (customer confirms order)
Order Processing
↓ (order validated and saved)
SQL Database
↓ (order stored with status: Placed)
Admin Panel
↓ (admin updates status: Processing → Shipped → Delivered)
Order Tracking Page
↓ (customer views real-time status)
Customer Notification (future — email alert)



Activity 4 — Data Quality and Risk Analysis

| Data Item | Risk | Business Impact | Prevention Strategy |
|---|---|---|---|
| Order Status | Admin forgets to update status | Customer has no visibility of order | Mandatory status update workflow |
| Customer Email | Invalid email entered | Customer cannot receive notifications | Email format validation on registration |
| Delivery Address | Incomplete address entered | Order cannot be delivered | Required field validation + address format check |
| Product Price | Incorrect price entered by admin | Customer charged wrong amount | Numeric validation + admin confirmation step |
| Stock Level | Not updated after order placed | Overselling — item sold when out of stock | Auto-decrement stock on order confirmation |
| Payment Status | Not recorded correctly | Order fulfilled without payment | Payment gateway confirmation before order saved |
| Admin ID | Not recorded on status update | No accountability for changes | Auto-record admin session ID on every update |
| Order ID | Duplicate ID generated | Two orders with same ID — data corruption | System-generated unique ID using UUID |
| Tracking Number | Not updated after shipping | Customer cannot track with courier | Required field when admin marks as Shipped |
| Last Updated Timestamp | Not recorded on changes | No audit trail of status history | Auto-record timestamp on every status change |

---

Activity 5 — Planning for Future Development

*What information should be stored permanently?**
- Customer accounts, order history, product catalogue, payment records, admin activity logs

*What information changes frequently?**
- Order Status, Stock Level, Last Updated Timestamp, Estimated Delivery Date

*What information should be restricted to administrators?**
- Admin ID, Payment Status, all customer personal details, full order history across all customers

*What information should be included in future reports?**
- Total orders per day/week/month, revenue statistics, most popular products, average delivery time

*What information might be required in Capstone B Version 2?**
- GPS tracking coordinates from courier API, customer review and rating data, return/refund status, loyalty points balance
