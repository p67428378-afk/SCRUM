# FlixFlow - Movie and Series Management System

A Netflix-like full-stack entertainment platform providing media catalog management, user discovery, streaming metadata, watch history tracking, and personal watchlists.

## Tech Stack
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.x, PostgreSQL / SQLite, PyJWT, Passlib (Bcrypt)
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, Lucide Icons

---

## Backend Setup & Instructions

### 1. Environment Configuration
Copy the `.env.example` file or create `.env` in the repo root:
```bash
cp .env.example .env
```
Default environment variables:
```env
DATABASE_URL=sqlite:////tmp/app.db
JWT_SECRET_KEY=dev-secret-change-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2. Install Dependencies
Create a virtual environment and install requirements:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r server/requirements.txt
```

### 3. Run Development Server
Start the FastAPI server on port 8000:
```bash
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 4. Run Backend Tests
Run test suite using pytest:
```bash
pytest server/tests
```

---

## Full-Stack Local Development

### Default Test Credentials
The database initializes with the following default accounts for testing:
- **Subscriber Account**:
  - Email: `test@example.com`
  - Password: `testpassword`
  - Role: `subscriber`
- **Admin Account**:
  - Email: `admin@example.com`
  - Password: `adminpassword`
  - Role: `admin`

### Starting Both Servers
1. **Backend** (Port 8000):
   ```bash
   uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. **Frontend** (Port 5173):
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
