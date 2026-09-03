# Cafe Management System Portal

A full-stack Cafe Management System Portal allowing cafe staff and managers to update menus, manage live order queues, handle table reservations, and monitor sales analytics.

## Tech Stack
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.x, SQLite (dev/test) / PostgreSQL (prod), Pydantic v2
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, Lucide React icons

---

### 1. Environment Setup
Create a virtual environment and install backend dependencies:
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables
Copy `.env.example` to `.env` or set the following environment variables:
```env
DATABASE_URL=sqlite:////tmp/cafe.db
JWT_SECRET_KEY=dev-secret-change-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Running the Backend Development Server
To start the FastAPI server on port 8000:
```bash
uvicorn server.main:app --reload --port 8000
```
Interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 4. Running Backend Tests
To execute the pytest suite with coverage:
```bash
pytest server/tests
```

---

## Full-Stack Local Development

### 1. Starting Backend
Run the FastAPI backend on port 8000:
```bash
uvicorn server.main:app --reload --port 8000
```

### 2. Starting Frontend
Navigate to `client/`, install dependencies, and start the Vite dev server on port 5173:
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Pre-Seeded Test Credentials
If authentication is enabled, use the following seeded test accounts:
- **Staff User**: `test@example.com` / `testpassword`
- **Manager/Admin**: `admin@example.com` / `adminpassword`

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

