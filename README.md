# SheaMart – Order Tracking Module

## Capstone B – Sprint 3

### Project Overview
SheaMart is a retail store project. My assigned module is Order Tracking, which focuses on recording and managing customer order status information.

### Sprint 3 Objectives
- Create the Order Tracking database.
- Implement the Orders and Order Status tables.
- Insert sample order and tracking data.
- Test database queries.
- Document development work using GitHub.

### Database Implementation
**Database:** `database/sheamart.db`

**SQL File:** `database/order_status.sql`

The database currently contains two application tables:

**1. Orders**
- order_id
- customer_name
- order_date

**2. Order Status**
- status_id
- order_id
- status
- updated_at
- remarks

### Sample Data
Three sample orders and their corresponding tracking statuses have been inserted successfully.

| Order ID | Status | Description |
|---|---|---|
| 1 | Pending | Order received |
| 2 | Processing | Preparing order |
| 3 | Shipped | Order dispatched |

### Testing and Verification
The database was created using Python's built-in SQLite library. SQL SELECT queries were executed successfully to verify the database tables and stored records.

### Tools and Technologies
- Visual Studio Code
- SQLite
- Python 3.12
- SQL
- Git and GitHub

### My Sprint 3 Contribution
My contribution involved creating the Order Tracking database structure, implementing the Orders and Order Status tables, inserting sample data and verifying database functionality.

### Future Development
The next stage will involve connecting the database to a backend server and developing functionality for retrieving and updating customer order statuses.
