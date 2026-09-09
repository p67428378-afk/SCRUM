# Actor Portfolio System (SCRUM-243)

Comprehensive online actor portfolio system allowing actors to manage profile details, headshots, performance reels, and filmography credits, and share a unique public link with casting directors.

## Features
- **Actor Profile & Bio Management**: Editable bio, physical attributes (height, eye color, hair color, voice type), location, union affiliations (SAG-AFTRA, Equity), and social links.
- **Media Gallery & Headshots**: Headshot uploads, primary headshot designation, performance reel links (YouTube/Vimeo), and PDF resumes.
- **Filmography & Credits**: Categorized credits (Theater, Film, Television, Commercials, Voiceover) with role, production, director, and year.
- **Public Portfolio Page**: Unauthenticated responsive public portfolio page accessible via custom URL slug (e.g. `/actors/john-doe`).

### Setup Environment
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Run Server
```bash
uvicorn server.main:app --reload --port 8000
```

### Run Tests
```bash
pytest server/tests
```

## Full-Stack Local Development
1. Start Backend on `http://localhost:8000`:
   `cd server && uvicorn server.main:app --reload --port 8000`
2. Start Frontend on `http://localhost:5173`:
   `cd client && npm run dev`

### Test Credentials
- Regular User: `test@example.com` / `testpassword` (slug: `john-doe`)
- Admin User: `admin@example.com` / `adminpassword`

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

