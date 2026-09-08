# 🏡 Village Management System

A comprehensive Village Management System enabling village residents to book facilities, view announcements, and submit maintenance tickets, while enabling village administrators and staff to manage resident profiles, approve bookings, broadcast notices, and track service requests.

---

## 🛠️ Server Setup & Development

### Prerequisites
- Python 3.11+
- pip or uv package manager

### Environment Setup
Create a virtual environment and install dependencies:

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration
Copy the `.env.example` file to `.env` at the repository root:

```bash
cp .env.example .env
```

Default local environment variables:
- `DATABASE_URL`: `sqlite:////tmp/village.db`
- `JWT_SECRET_KEY`: `dev-secret-key-for-village-os-change-in-prod`
- `ALLOWED_ORIGINS`: `http://localhost:5173,http://localhost:3000`

### Running the Server
Start the development API server using Uvicorn:

```bash
uvicorn server.main:app --reload --port 8000
```

The API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Running Tests
Execute the pytest suite:

```bash
pytest
```

---

## 🌐 Full-Stack Local Development

To run the complete application locally:

1. **Backend (FastAPI)**:
   - Follow the server setup steps above and start the server on port `8000`.
   - Health check URL: `http://localhost:8000/health`

2. **Frontend (React / Vite)**:
   - Navigate to the `client/` directory.
   - Install dependencies: `npm install`
   - Start the Vite development server: `npm run dev`
   - Access the web interface at `http://localhost:5173`

---

## 🔑 Pre-Seeded Test Credentials

The database automatically seeds the following test accounts on startup:

| Account Type | Email | Password | Role | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `adminpassword` | `Admin` | Full system access, facilities management, announcements publisher |
| **Resident** | `test@example.com` | `testpassword` | `Resident` | Facility bookings, service request submission, directory & notice view |
| **Staff** | `staff@example.com` | `staffpassword` | `Staff` | Maintenance ticket resolution & staff assignment |

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

