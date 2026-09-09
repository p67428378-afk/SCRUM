# Athenaeum Library Management System - Frontend Client

Modern, responsive React 18 frontend built with Vite, Tailwind CSS, and Lucide React icons.

## Features

- **Book Catalog & Search**: Multi-criteria search (title, author, genre, ISBN) with real-time stock availability badges.
- **Patron Loans Dashboard**: View active loans, track upcoming due dates, and request 14-day renewals or returns.
- **Admin Control Console**: Centralized catalog ingestion (Add Book form), total inventory metrics, and overdue loan monitoring.
- **Authentication & RBAC**: Patron vs Admin role switching with pre-filled test credentials.

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default `VITE_API_BASE_URL` is `http://localhost:8000`.

### Install Dependencies

```bash
npm install
```

### Run Local Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Run Unit Tests

```bash
npm test
```

## Key Architectural Decisions

- **Vite Bundler**: Fast ESM-based dev server and optimized production build output.
- **Tailwind CSS**: Utility-first CSS configured with custom brand tokens (`#122338` primary, `#0d6847` secondary, `#ba1a1a` error).
- **Graceful Error Handling & Fallbacks**: Defensive array unwrap in the API layer (`api.js`) and top-level React Error Boundary (`main.jsx`) prevent blank screen rendering.
- **Safe Authentication Context**: Persistent token storage with safe JSON parsing and silent auth expiration renewal.
