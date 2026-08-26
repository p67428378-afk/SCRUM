# Expense Tracker Application

A personal finance management platform designed to record income and expenses, categorize transactions, and view detailed financial summaries with category spending breakdowns.

## Architecture

- **Backend**: FastAPI (Python 3.11), SQLAlchemy 2.x, Pydantic v2, SQLite (tests) / PostgreSQL (production).
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide icons.

---

### Prerequisites
- Python 3.11+
- Virtualenv / `venv`

### Installation & Run
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run server on port 8000
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Tests
```bash
pytest server/tests -v
```

---

## Full-Stack Local Development

1. **Backend**:
   - Navigate to `server/`, create virtualenv, install dependencies from `requirements.txt`.
   - Run `uvicorn server.main:app --port 8000 --reload`.
2. **Frontend**:
   - Navigate to `client/`, run `npm install`.
   - Run `npm run dev` (starts on `http://localhost:5173`).
3. **API Endpoints**:
   - `GET /health` - Health check probe
   - `GET /api/v1/categories` - List categories
   - `POST /api/v1/categories` - Create custom category
   - `GET /api/v1/expenses` - List transactions with filters
   - `POST /api/v1/expenses` - Record transaction
   - `GET /api/v1/expenses/{id}` - Get transaction by ID
   - `PUT /api/v1/expenses/{id}` - Update transaction
   - `DELETE /api/v1/expenses/{id}` - Delete transaction
   - `GET /api/v1/summary` - Financial summary and spending breakdown

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

