# Week 2 - Data Analysis

## Activity 1 - Data Inventory

The SheaMart system requires different types of data to support its retail
order management functions.

| Module | Information Required |
|---|---|
| Product Catalogue | Product ID, Product Name, Description, Category, Price, Stock Level |
| Shopping Cart | Cart ID, User ID, Product ID, Quantity, Item Price, Cart Total |
| Order Processing | Order ID, User ID, Product Details, Quantity, Order Total, Order Date, Payment Status |
| User Management | User ID, Full Name, Email, Password, User Role |
| Order Tracking | Order ID, Order Status, Tracking Information, Order Date, Delivery Status |
| Admin Dashboard | User Information, Product Information, Order Information, Sales Statistics |
| Contact Form | Full Name, Email Address, Phone Number, Message |

### Current Prototype Observation

The current prototype displays product information including product name,
category, description and price. It also provides Add to Cart buttons.

The Contact Form currently collects Full Name, Email Address, Phone Number
and Message.

Some modules such as User Management, Order Processing, Order Tracking and
Admin Dashboard are currently represented as planned system features and
will require additional data and backend functionality in future versions.


## Activity 2 - Data Flow Investigation

The planned SheaMart system will move information between customers,
different system modules and the database.

### Main System Data Flow

Customer  
↓  
Product Catalogue  
↓  
Product Selection  
↓  
Shopping Cart  
↓  
Order Processing  
↓  
Database  
↓  
Order Tracking  
↓  
Customer

### Contact Form Data Flow

Customer  
↓  
Contact Form  
↓  
Enter Full Name, Email, Phone Number and Message  
↓  
Client-Side Validation  
↓  
Valid Information?  
↓  
Yes → Display "Message sent successfully"

If the information is invalid:

Invalid Information  
↓  
Display Error Message  
↓  
Customer Corrects Information  
↓  
Submit Again

### Current Prototype Observation

The current Contact Form performs client-side validation before displaying
a successful submission message. The current prototype does not show the
contact information being sent to or stored in a backend database.


## Activity 3 - Data Risk Analysis

The SheaMart system may process customer, product and order information.
Therefore, the project needs to consider security, privacy and data
integrity risks.

| Area | Data Risk | Risk Level | Suggested Control |
|---|---|---|---|
| User Accounts | Passwords or account information could be exposed | High | Hash passwords and apply secure authentication |
| Customer Information | Names, emails and phone numbers could be accessed without permission | High | Restrict access and protect stored personal information |
| Contact Form | Users may submit invalid or malicious input | Medium | Validate and sanitise user input |
| Shopping Cart | Users could access or modify another user's cart | High | Link carts to authenticated users and enforce access control |
| Product Data | Product prices or stock levels could be changed without permission | High | Allow authorised admins only to modify products |
| Order Processing | Order information could be modified or incorrectly recorded | High | Validate order data before storing it |
| Order Tracking | Customers could access another customer's order information | High | Verify user ownership before displaying order details |
| Admin Dashboard | Unauthorised users could access sensitive system information | High | Use role-based access control |
| Data Transmission | Customer information could be intercepted | High | Use HTTPS |
| Database | Stored information could be lost or compromised | High | Use access controls, secure backups and database security |

### Risk Summary

The most important risks for SheaMart involve protecting customer
information, user accounts and order data. Role-based access control should
be used so regular users can access only their own information while
administrators have controlled access to management functions.

Input validation should also be implemented on both the client and server
side. The current Contact Form performs basic client-side validation, but
server-side validation will be required when backend functionality is added.
