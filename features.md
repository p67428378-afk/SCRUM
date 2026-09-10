# Project Features

## SCRUM-252 - Secure Peer-to-Peer (P2P) Money Transfer Module

### Feature Summary
Allows banking app users to securely input a recipient ID and transfer amount, processing P2P money transfers with real-time fraud checking and balance validation.

### Key Features
- Full-Stack P2P Transfer Portal Interface (React 18 + Vite + Tailwind CSS)
- FastAPI Backend Transfer Endpoint (POST /api/v1/transfers)
- Synchronous Fraud Detection (> $10,000 threshold limit)
- Account Balance & Insufficient Funds Validation
- PostgreSQL Database Schema & Alembic Migration with UUID primary keys
- Comprehensive Test Suite for Success & Fraud/Insufficient Funds Edge Cases
