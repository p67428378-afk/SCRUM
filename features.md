# Project Features

## SCRUM-267 - Secure Peer-to-Peer (P2P) Money Transfer Module

### Feature Summary
As a banking app user, I want to securely transfer money to another user in real-time via a clean transfer portal component, so that I can send peer-to-peer payments conveniently with automated fraud prevention and instant balance verification.

### Key Features
- React 18 + Vite + Tailwind CSS Transfer Portal UI component
- FastAPI RESTful endpoint (POST /api/v1/transfers)
- Synchronous Fraud Detection Rule ($10,000 threshold block)
- Account Balance Verification ("Insufficient funds" block)
- PostgreSQL database with SQLAlchemy ORM and Alembic migration for UUID primary keyed transfers table
