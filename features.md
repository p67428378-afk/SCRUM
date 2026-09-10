# Project Features

## SCRUM-253 - Secure Peer-to-Peer (P2P) Money Transfer Module

### Feature Summary
Enables banking app users to perform real-time peer-to-peer transfers with automated checks for fraud thresholds ($10,000) and insufficient funds, supported by a modern React portal.

### Key Features
- FastAPI POST /api/v1/transfers endpoint for peer-to-peer transfers
- Synchronous fraud detection blocking transfers > $10,000
- Synchronous balance check returning 'Insufficient funds' when applicable
- PostgreSQL Transfers schema with UUID primary keys & Alembic migrations
- React 18 + Vite + Tailwind CSS transfer portal component with error/success feedback
