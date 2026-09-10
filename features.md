# Project Features

## SCRUM-270 - Secure Peer-to-Peer (P2P) Money Transfer Module

### Feature Summary
Enables banking app users to perform peer-to-peer fund transfers securely with instant validation and error feedback.

### Key Features
- FastAPI REST endpoint (POST /api/v1/transfers) for processing peer-to-peer transfers
- Synchronous fraud detection rules flagging transfers >$10,000 and checking account balance for insufficient funds
- PostgreSQL database persistence using SQLAlchemy ORM and Alembic UUID migrations
- React 18 + Vite + Tailwind CSS interactive transfer portal component with error and success messaging
