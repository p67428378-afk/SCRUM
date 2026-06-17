# SCRUM

## Client

### Prerequisites
- Node.js 16+ and npm 7+

### Setup

1. Install dependencies:
```bash
cd client
npm install
cd ..
```

### Available Commands

**Development Server:**
```bash
cd client
npm run dev
cd ..
```
Opens the app at `http://localhost:5173`

**Production Build:**
```bash
cd client
npm run build
cd ..
```
Creates optimized build in `client/dist/`

**Run Tests:**
```bash
cd client
npm test
cd ..
```

**Build & Preview:**
```bash
cd client
npm run preview
cd ..
```
Preview production build locally

### Environment Variables

Create a `.env.local` file in the `client/` directory:
```
VITE_API_BASE_URL=http://localhost:8000
```

The frontend will connect to the backend API at this URL.

