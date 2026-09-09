# Project Features

## SCRUM-249 - User Story: Secure Peer-to-Peer (P2P) Money Transfer Module

### Feature Summary
Allows banking app users to securely input a recipient and transfer amount, processing real-time P2P transfers while automatically blocking fraud and insufficient funds transactions.

### Key Features
- FastAPI backend with POST /api/v1/transfers endpoint accepting sender_id, receiver_id, amount
- Synchronous fraud detection rule flagging and blocking transfers exceeding $10,000.00
- Balance check blocking transfers when sender has insufficient funds
- PostgreSQL database with SQLAlchemy 2.x ORM and Alembic migrations for Transfers table with UUID primary keys
- React 18 + Vite + Tailwind CSS transfer portal component displaying success confirmation or clear error messages
- Comprehensive QA unit/integration test cases covering success, fraud block, and insufficient funds edge cases
