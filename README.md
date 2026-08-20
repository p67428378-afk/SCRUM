# BharatGeo Portal - Indian Geography Regional API

Full-stack interactive map and regional directory portal for Indian States and Union Territories.

### Prerequisites
- Python 3.11+
- virtualenv / venv

### Setup Instructions

1. **Create and Activate Virtual Environment**:
   ```bash
   python -m venv venv
   # On Linux/macOS
   source venv/bin/activate
   # On Windows
   venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r server/requirements.txt
   ```

3. **Environment Variables**:
   Copy `.env.example` to `.env` or set environment variables:
   ```env
   DATABASE_URL=sqlite:///./app.db
   REDIS_URL=redis://localhost:6379/0
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

4. **Start Backend Server**:
   ```bash
   python -m uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The API will be available at `http://localhost:8000/api/v1/regions`.

5. **Run Tests**:
   ```bash
   pytest server/tests/
   ```

## Full-Stack Local Development

- **Backend API**: Runs on `http://localhost:8000`
- **Frontend App**: Runs on `http://localhost:5173` (Vite dev server)

### Endpoints
- `GET /api/v1/regions` - List all 28 states and 8 Union Territories
  - Query parameters:
    - `type`: `all` (default), `state`, or `union_territory`
    - `q`: Search string matching state name or capital city

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

