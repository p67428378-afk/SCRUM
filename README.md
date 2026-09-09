# Secure Peer-to-Peer (P2P) Money Transfer Module

## Overview
A secure, real-time peer-to-peer (P2P) funds transfer platform built with FastAPI, PostgreSQL, SQLAlchemy 2.x, Alembic, and React 18 + Vite + Tailwind CSS. The backend synchronously evaluates business rules, blocking single transfers strictly exceeding $10,000.00 and rejecting transactions where the sender has insufficient funds.

---

## Architecture & Technology Stack
- **Backend Framework**: Python 3.11, FastAPI
- **ORM & Database**: SQLAlchemy 2.x, PostgreSQL (Production) / SQLite (Testing)
- **Database Migrations**: Alembic
- **Validation**: Pydantic v2
- **Testing**: Pytest, HTTPX, SQLite in-memory with StaticPool
- **Frontend**: React 18, Vite, Tailwind CSS, Axios

---

## API Endpoints (`/api/v1`)

### 1. Peer-to-Peer Transfer
- **`POST /api/v1/transfers`**
  - **Description**: Submits an immediate funds transfer between two accounts.
  - **Request Body**:
    ```json
    {
      "sender_id": "550e8400-e29b-41d4-a716-446655440000",
      "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "amount": 250.00
    }
    ```
  - **Response (`201 Created`)**:
    ```json
    {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "sender_id": "550e8400-e29b-41d4-a716-446655440000",
      "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "amount": 250.00,
      "status": "COMPLETED",
      "created_at": "2026-05-18T10:00:00Z",
      "updated_at": "2026-05-18T10:00:00Z"
    }
    ```
  - **Error Responses**:
    - `400 Bad Request` with `{"detail": "Blocked: Fraud threshold exceeded"}` (if amount > $10,000.00).
    - `400 Bad Request` with `{"detail": "Insufficient funds"}` (if sender balance < amount).
    - `404 Not Found` (if sender or receiver account does not exist).
    - `422 Unprocessable Entity` (if amount <= 0 or invalid UUID format).

### 2. Transaction & Account History
- **`GET /api/v1/transfers`**: List recorded transfers (paginated `?skip=0&limit=100`).
- **`GET /api/v1/transfers/accounts`**: List all active accounts and their current balances.
- **`GET /api/v1/transfers/accounts/{account_id}`**: Get specific account details.

---

### 1. Environment Configuration
Copy the `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```

### 2. Backend Installation & Run
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r server/requirements.txt

# Run database migrations
alembic -c server/alembic.ini upgrade head

# Start FastAPI development server (from repository root)
python -m uvicorn server.app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Running Backend Tests
```bash
pytest -v server/tests
```

---

## Full-Stack Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Starting Backend & Frontend
1. **Backend** (Port 8000):
   ```bash
   python -m uvicorn server.app.main:app --reload --host 0.0.0.0 --port 8000
   ```
2. **Frontend** (Port 5173):
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Default Pre-Seeded Accounts
- **Sender Account**: `550e8400-e29b-41d4-a716-446655440000` (Balance: $12,450.00)
- **Receiver Account**: `6ba7b810-9dad-11d1-80b4-00c04fd430c8` (Balance: $1,000.00)

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

