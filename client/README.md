# SecureBank Peer-to-Peer (P2P) Transfer Client

A modern, responsive React 18 single-page application built with Vite and Tailwind CSS for peer-to-peer money transfers with real-time feedback, fraud detection alerts, and transaction history.

## Features

- **P2P Transfer Form**: Instant money transfers with recipient validation and quick preset shortcuts.
- **Synchronous Fraud Interception Alert**: Clean crimson alert badge when transfer attempts exceed the $10,000 threshold.
- **Account Balance Verification**: Warning and block notifications for insufficient available balance.
- **Live Settlement Ledger**: Real-time transaction history showing UUID, counterparty, amount, and COMPLETED status.
- **Receipt Modal**: Instant transaction receipt with print/download functionality.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
cd client
npm install
```

### Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to the running backend service (default: `http://localhost:8000`).

### Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`.

### Testing

```bash
npm test
```

### Production Build

```bash
npm run build
```
