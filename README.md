# Farm Management System (SCRUM-259)

A centralized full-stack Farm Management System to track crop cycles, livestock health, equipment maintenance, and input inventory across fields in real-time.

## Features & Modules

- **Authentication & RBAC**: JWT authentication with roles (`farm_manager`, `admin`, `operator`).
- **Field & Crop Cycle Management**: Define field parcels, assign crop cycles, track planting and target harvest dates, and detect overlapping crop cycles.
- **Livestock Tracking & Health Records**: Log animal profiles, health inspections, vaccination schedules, and medical notes.
- **Equipment Maintenance**: Track machine operating hours, service logs, and automatically trigger maintenance alerts when thresholds are reached.
- **Input Inventory**: Monitor stock levels for fertilizers, pesticides, seeds, and fuel with automated low-stock alerts and negative quantity rejection.
- **Operational Dashboard**: Real-time KPI summary and active operational alerts.

---

### Prerequisites
- Python 3.11+
- Virtual environment tool (`venv` or `uv`)

### Installation & Execution

1. Navigate to the root directory and set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r server/requirements.txt
   ```

3. Configure environment variables (optional):
   ```bash
   cp server/.env.example .env
   ```

4. Run the development server:
   ```bash
   uvicorn server.main:app --reload --port 8000
   ```
   The API will be accessible at `http://localhost:8000`. Swagger documentation is available at `http://localhost:8000/docs`.

### Running Backend Tests

Run all unit and integration tests using pytest:
```bash
pytest server/tests -v
```

---

## Full-Stack Local Development

When running both backend and frontend locally:

1. **Start Backend Server**:
   ```bash
   uvicorn server.main:app --reload --port 8000
   ```

2. **Start Frontend Server** (in a separate terminal inside `client/`):
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The frontend dev server runs on `http://localhost:5173`.

### Test Credentials

- **Farm Manager**: `test@example.com` / `testpassword`
- **Admin**: `admin@example.com` / `adminpassword`

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

