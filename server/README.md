# Actress Portfolio Backend API

FastAPI backend service for the Actress Portfolio Website (SCRUM-247).

## Features
- **Filmography Credits API**: `/api/v1/credits`
- **Media Gallery API**: `/api/v1/gallery`
- **Contact & Inquiries API**: `/api/v1/contact`

## Setup & Running Locally

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r server/requirements.txt
   ```

2. Set environment variables (optional):
   ```bash
   cp server/.env.example .env
   ```

3. Run the development server:
   ```bash
   uvicorn server.main:app --reload --port 8000
   ```

4. Run unit and integration tests:
   ```bash
   pytest server/tests
   ```

## Full-Stack Local Development
- Backend API runs on `http://localhost:8000`
- Frontend React Vite app runs on `http://localhost:5173`
