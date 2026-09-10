# Project Features

## SCRUM-262 - Secure Peer-to-Peer (P2P) Money Transfer Module

### Feature Summary
Allows banking app users to perform real-time peer-to-peer money transfers with fraud detection and balance validation.

### Key Features
- React 18 + Vite + Tailwind CSS Transfer Portal UI with real-time feedback
- FastAPI RESTful endpoint (POST /api/v1/transfers)
- Synchronous Fraud Detection Rule ($10,000 threshold block)
- Account Balance Verification (Insufficient funds block)
- PostgreSQL database with SQLAlchemy ORM and Alembic migration for UUID primary keyed transfers table
