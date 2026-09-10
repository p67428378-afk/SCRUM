# BiblioCentral Library Management System - Frontend Client

A responsive Single Page Application (SPA) built with React 18, Vite, and Tailwind CSS for the BiblioCentral Library Management System.

## Features

- **Book Catalog & Search**: Search, filter, and inspect available book inventory in real-time.
- **Patron Dashboard**: Track active borrowings against membership tier limits (Standard: 5, Premium: 10), view due dates, and settle overdue fines.
- **Staff Circulation Desk**: Dual-panel checkout and return processing with automated overdue fine calculation ($0.50/day up to $25 cap).
- **Staff Administration Console**: Manage book inventory stock (CRUD) and patron member accounts.

## Local Development Setup

### 1. Prerequisites

- Node.js 18+
- npm 9+

### 2. Install Dependencies

```bash
cd client
npm install
```

### 3. Environment Configuration

Ensure `client/.env` contains the backend API Base URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### 5. Run Tests & Quality Checks

```bash
npm test
npm run build
```

## Test Accounts

- **Patron**: `test@example.com` / `testpassword`
- **Staff**: `staff@example.com` / `adminpassword`
- **Admin**: `admin@example.com` / `adminpassword`
