# Patient Management System (CarePulse EHR)

A modern full-stack Patient Management System for healthcare facilities to manage patient registration, clinical records, and appointment scheduling.

## Features
- **Patient Intake & Registration**: Demographics, contact info, insurance policy tracking, and duplicate SSN detection.
- **Medical Records Management**: Secure storage of clinical notes, known allergies, active medications, and consultation history.
- **Appointment Scheduling**: Real-time provider availability, collision detection with alternative slot suggestions, rescheduling, and cancellations.
- **Provider Management**: Healthcare provider directory with specialty breakdown.
- **RESTful API**: Built with FastAPI, SQLAlchemy 2.x, Pydantic, and SQLite/PostgreSQL.

---

### 1. Prerequisites
- Python 3.11+
- Virtual environment (`venv` or `uv`)

### 2. Installation
```bash
cd server
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=sqlite:////tmp/patient_management.db
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Running the Development Server
```bash
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`

### 5. Running Tests
```bash
pytest server/tests/ -v
```

---

## Full-Stack Local Development

### Starting Both Backend and Frontend

1. **Backend Server** (Terminal 1):
   ```bash
   uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Frontend Client** (Terminal 2):
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The client will start at `http://localhost:5173`.

### Port Conventions
- **Backend API**: `http://localhost:8000` (API routes under `/api/v1`)
- **Frontend SPA**: `http://localhost:5173`
- **Health Check**: `http://localhost:8000/api/v1/health`

### Seeded Test Data
- **Sample Patient**: Jane Doe (UUID: `p8f2e1a0-4b2c-4f81-9b10-1a2b3c4d5e6f`, SSN: `999-00-1234`)
- **Available Providers**:
  - Dr. Sarah Jenkins (Cardiology)
  - Dr. Robert Chen (General Medicine)
  - Dr. Emily Taylor (Pediatrics)
  - Dr. Marcus Vance (Neurology)

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

