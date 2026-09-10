# Secure P2P Money Transfer Module Backend

FastAPI backend providing real-time peer-to-peer transfers, synchronous fraud limit detection, and account balance verification.

## Features
- **P2P Transfers API**: `POST /api/v1/transfers`
- **Fraud Engine**: Synchronous enforcement blocking transfers exceeding $10,000.00 (`amount > 10000.00`)
- **Balance Verification**: Synchronous balance check rejecting insufficient funds with HTTP 400
- **Database & Migrations**: SQLAlchemy 2.x ORM models with Alembic migrations
- **CORS Support**: Configured for local React development (`http://localhost:5173`)

## Setup and Running

```bash
# Install dependencies
pip install -r server/requirements.txt

# Run migrations
alembic -c server/alembic.ini upgrade head

# Run tests
pytest

# Start the server (from repo root)
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

## Test Credentials
- User: `test@example.com` / `testpassword`
- Receiver: `receiver@example.com` / `testpassword`
- Admin: `admin@example.com` / `adminpassword`
