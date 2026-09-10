# Project Features

## SCRUM-254 - Secure Peer-to-Peer (P2P) Money Transfer Module

### Feature Summary
Enables users to send money directly to recipients via a modern React portal with instant backend fraud checks and database persistence.

### Key Features
- FastAPI backend endpoint POST /api/v1/transfers accepting sender_id, receiver_id, and amount
- Synchronous fraud detection blocking transfers > $10,000 with 'Blocked: Fraud threshold exceeded'
- Balance validation returning 'Insufficient funds' when sender funds are inadequate
- PostgreSQL database with SQLAlchemy 2.x ORM and Alembic migration for Transfers table with UUID primary keys
- React 18 + Vite + Tailwind CSS transfer portal component displaying success confirmation or exact error states
