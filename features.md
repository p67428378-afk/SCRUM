# Project Features

## SCRUM-66 — Food Delivery Portal for Bandra Hotel

### Feature Summary
Food Delivery Portal for Bandra Hotel

### User Stories
# Food Delivery Portal for Bandra Hotel

**Objective:**
Build a modern food delivery portal for Bandra Hotel enabling customers to browse menu items, place online food orders, and track order fulfillment.
Provide restaurant staff with order management capabilities to process incoming orders efficiently and update delivery status.

**Key Features:**
- Digital Menu Browsing with category filtering and item details
- Shopping Cart & Checkout with address input and payment processing
- Real-time Order Tracking and status updates
- Order Management Dashboard for hotel staff to manage and fulfill orders
- User Authentication & Profile Management for customers

**Description:**
As a Customer of Bandra Hotel,
I want to browse menu items, place food delivery orders online, and track order delivery status,
So that I can conveniently enjoy Bandra Hotel meals delivered to my doorstep.

**Acceptance Criteria:**

- **Menu Browsing & Filtering:** System shall display all available menu items categorized (e.g., Appetizers, Main Course, Desserts, Beverages) with images, descriptions, prices, and dietary tags.
  - **Example:** A customer selects "Main Course" and views items like "Butter Chicken - $14.99" with dietary tags and customization options.

- **Cart & Order Placement:** Users can add/remove items to cart, modify quantities, specify special instructions, and complete checkout with delivery address and payment details.
  - **Example:** Adding 2x Biryani ($25.00) + delivery fee ($3.00) = $28.00 total order placed with address details.

- **Order Tracking & Status:** Customers receive a unique order ID and can view live order status (Placed, Confirmed, Preparing, Out for Delivery, Delivered).
  - **Example:** Order #BD-1042 displays status "Out for Delivery" with estimated delivery time within 30-45 minutes.

- **Staff Order Management:** Hotel staff can view real-time incoming orders, update status (Confirm, In Prep, Ready for Pickup, Dispatched), and manage menu availability.
  - **Example:** Staff marks Order #BD-1042 as "Preparing" which immediately updates the customer's tracking view.

- **User Authentication & Profile:** Users can register, log in, view order history, save delivery addresses, and manage account details.
  - **Example:** Returning customer logs in and re-orders a past order with one click using saved address.

**Technical Requirements:**
- RESTful API endpoints for menu, cart, orders, and authentication (`/api/v1/menu`, `/api/v1/orders`, `/api/v1/auth`).
- Database schema supporting Users, Menu Items, Categories, Orders, Order Items, and Delivery Addresses.
- Security: Secure password hashing, JWT authentication, input validation, and role-based access control (Customer vs Admin/Staff).
- Error handling with appropriate HTTP status codes and user-friendly error messages.

### Acceptance Criteria
- Menu Browsing & Filtering: System shall display all available menu items categorized with images, descriptions, prices, and dietary tags.
- Cart & Order Placement: Users can add/remove items to cart, modify quantities, specify special instructions, and complete checkout with delivery address and payment details.
- Order Tracking & Status: Customers receive a unique order ID and can view live order status (Placed, Confirmed, Preparing, Out for Delivery, Delivered).
- Staff Order Management: Hotel staff can view real-time incoming orders, update status, and manage menu availability.
- User Authentication & Profile: Users can register, log in, view order history, save delivery addresses, and manage account details.

### Backend Tasks
- None specified

### Frontend Tasks
- None specified

### Database Changes
Not yet authored.

### API Endpoints
- `POST /api/v1/auth/register` — Register a new customer account
- `POST /api/v1/auth/login` — Authenticate user and return JWT bearer token
- `GET /api/v1/auth/me` — Fetch currently logged-in user profile & addresses
- `GET /api/v1/menu/categories` — List all menu categories
- `GET /api/v1/menu/items` — List menu items with category & dietary filter options
- `POST /api/v1/menu/items` — Create new menu item
- `PUT /api/v1/menu/items/{id}` — Update menu item details or availability
- `POST /api/v1/orders` — Submit cart checkout and place food delivery order
- `GET /api/v1/orders/my-orders` — Retrieve order history for logged-in customer
- `GET /api/v1/orders/{id}` — Get tracking details and live status for an order
- `GET /api/v1/orders/staff/dashboard` — Fetch active incoming/fulfillment orders queue
- `PATCH /api/v1/orders/{id}/status` — Transition order status

### UI Components
Not yet authored.

### Test Coverage
Not yet authored.

### Deployment Notes
Not yet authored.
