# Book Haven E-Commerce Platform

Book Haven is an online bookstore platform built with a modern, decoupled architecture featuring a FastAPI Python backend and a React/Tailwind frontend.

---

## Full-Stack Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Git

### Test Accounts
The database is pre-seeded on startup with test accounts:
- **Regular Customer**:
  - **Email**: `test@example.com`
  - **Password**: `testpassword`
- **Admin Manager**:
  - **Email**: `admin@example.com`
  - **Password**: `adminpassword`

---

### 1. Environment Setup
```bash
# Navigate to repository root
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r server/requirements.txt
```

### 2. Run Tests
```bash
pytest server/tests -v
```

### 3. Start Backend Server
```bash
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```
The API will be available at `http://localhost:8000`.
Interactive Swagger API documentation: `http://localhost:8000/docs`.

---

## Client Setup (Frontend)

### 1. Install & Start Frontend
```bash
cd client
npm install
npm run dev
```
The frontend dev server runs on `http://localhost:5173`.

---

## REST API Overview

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register`: Register user account and initialize shopping cart.
- `POST /api/v1/auth/login`: Authenticate and receive JWT access token.
- `GET /api/v1/auth/me`: Get current authenticated user profile.

### Catalog (`/api/v1`)
- `GET /api/v1/categories`: List all book categories.
- `GET /api/v1/books`: Browse and search books with keyword query, category filter, and pagination (`skip`, `limit`).
- `GET /api/v1/books/{id}`: Detailed metadata, real-time stock availability, and ratings.

### Shopping Cart (`/api/v1/cart`)
- `GET /api/v1/cart`: Get current user cart items, subtotal, estimated tax, and shipping.
- `POST /api/v1/cart/items`: Add book to cart or increment quantity with stock check.
- `PUT /api/v1/cart/items/{id}`: Update item quantity.
- `DELETE /api/v1/cart/items/{id}`: Remove item from cart.
- `DELETE /api/v1/cart`: Clear cart.

### Orders & Checkout (`/api/v1/orders`)
- `POST /api/v1/orders/checkout`: Place order, compute totals, decrement inventory, and clear cart.
- `GET /api/v1/orders`: Get authenticated user's order history.
- `GET /api/v1/orders/{id}`: Retrieve detailed order receipt.

## Server

### Prerequisites
- Python 3.9+
- pip and venv

### Setup

1. Create and activate virtual environment:
```bash
python -m venv server/.venv
# On Windows:
server\.venv\Scripts\activate
# On macOS/Linux:
source server/.venv/bin/activate
```

2. Install dependencies:
```bash
cd server
pip install -r requirements.txt
cd ..
```

### Running Tests
```bash
cd server
python -m pytest -v
cd ..
```

### Starting the Development Server
```bash
# Run from the repo root so that `from server.X` imports resolve correctly
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## Full-Stack Local Development

To run both backend and frontend together locally:

### 1. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env
```

### 2. Start the Backend (Terminal 1)
```bash
python -m venv server/.venv
source server/.venv/bin/activate  # On Windows: server\.venv\Scripts\activate
pip install -r server/requirements.txt
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API: `http://localhost:8000` | API Docs: `http://localhost:8000/docs`

### 3. Start the Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
```
Frontend: `http://localhost:5173`

The frontend connects to the backend API at `http://localhost:8000` by default via the `VITE_API_BASE_URL` environment variable.

### 4. Test Credentials
If the app has authentication, the backend seeds ready-to-use accounts on startup
(idempotent). These are guaranteed logged-in-able — every activation/verification
gate (`is_active`, `is_verified`, `email_verified`, `disabled`) is set to the
permissive value, so no manual DB step is needed:
- **Regular user** — Email: `test@example.com`, Password: `testpassword`
- **Admin user** (only when the app has roles/RBAC) — Email: `admin@example.com`, Password: `adminpassword`, role: `admin`

Passwords are stored hashed with the app's own hashing utility (never in plaintext).

### Port Reference
| Service  | Port | URL                        |
|----------|------|----------------------------|
| Backend  | 8000 | http://localhost:8000      |
| Frontend | 5173 | http://localhost:5173      |
| API Docs | 8000 | http://localhost:8000/docs |

