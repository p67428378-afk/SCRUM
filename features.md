# Project Features

## SCRUM-51 — Library Management System - Catalog, Borrowing, and User Management

### Feature Summary
Library Management System - Catalog, Borrowing, and User Management

### User Stories
# Library Management System - Catalog, Borrowing, and User Management

**Objective:**
Provide a comprehensive full-stack library management system that enables librarians to manage catalog items and borrowing transactions while allowing members to search books, reserve titles, and track their loan status.
This platform streamlines library operations, automates due-date tracking and fine calculations, and delivers an intuitive self-service portal for readers.

**Key Features:**
- Role-based authentication and user portal for Members and Librarians.
- Catalog management supporting book creation, updates, categorization, and search.
- Borrowing and return workflow with automatic inventory updates and due date tracking.
- Fine calculation and renewal mechanisms for active loans.
- Interactive user dashboard showing current loans, borrowing history, and saved titles.

**Description:**
As a Library Administrator / Member,  
I want a centralized, web-based Library Management System,  
So that librarians can efficiently manage book inventory and loans while members can seamlessly search, borrow, and track books.

**Acceptance Criteria:**

- **User Authentication and Role-Based Access Control (RBAC):**
  - **Explanation:** The system must support JWT-based authentication with two distinct roles: `Librarian` (admin access to manage inventory, view all loans, oversee fines) and `Member` (standard access to search catalog, borrow/reserve books, view personal history).
  - **Example:** A user logs in at `/api/v1/auth/login` with valid credentials. Upon successful authentication, a JWT access token containing role claims is returned and stored in frontend state to gate protected routes (`/admin` vs `/dashboard`).
  - **Edge Cases:** Expired tokens automatically trigger a refresh attempt via `/api/v1/auth/refresh` or redirect the user to login with an error message if invalid.

- **Book Catalog Management (CRUD & Search):**
  - **Explanation:** Librarians can create, update, delete, and view catalog entries (title, author, ISBN, genre, total copies, available copies). Members can perform fuzzy text search by title, author, or genre with pagination.
  - **Example:** A librarian adds a new book "The Clean Coder" with 5 available copies. A member searches for "Clean" via `GET /api/v1/books?query=Clean&skip=0&limit=20` and receives a list of matching titles.
  - **Edge Cases:** Attempting to create a duplicate book entry with an existing ISBN returns HTTP 400 Bad Request. Deleting a book with active loans is blocked with an HTTP 409 Conflict error.

- **Borrowing and Return Workflow:**
  - **Explanation:** Members can borrow available books (reducing available copies by 1) and return borrowed items (increasing available copies by 1). Active loan limits and due dates (e.g., 14-day borrowing window) are enforced.
  - **Example:** A member requests `POST /api/v1/loans/checkout` with `book_id`. The backend checks available copies > 0, generates a loan record with due date set to 14 days from checkout, and decrements available copies.
  - **Edge Cases:** If `available_copies` is 0, the system prevents checkout and offers a reservation option. If a user exceeds the maximum loan limit (e.g., 5 active books), checkout is rejected with HTTP 422.

- **Loan Renewal and Fine Calculation:**
  - **Explanation:** Members can renew an active loan once before the due date if no pending reservations exist. Returned items past the due date trigger automatic fine calculations based on overdue days.
  - **Example:** An overdue book returned 3 days late triggers a daily fine rate calculation (e.g., $0.50/day = $1.50 total fine) attached to the member's account.
  - **Edge Cases:** Renewal requests for already overdue items or books with active reservations are denied with specific error messages.

- **Responsive Frontend Dashboard & Catalog UI:**
  - **Explanation:** React-based single-page application using Tailwind CSS providing intuitive catalog browsing, search filters, book details modal, loan history table, and librarian management controls.
  - **Example:** A member logs into the React SPA, views their active loans in a responsive grid, clicks "Renew", and receives real-time UI feedback with updated due dates.
  - **Edge Cases:** Network failures during API calls display non-intrusive toast notifications and maintain optimistic UI consistency.

**Technical Requirements:**
- **Backend Architecture:** Python 3.11 with FastAPI and SQLAlchemy 2.x ORM targeting PostgreSQL database (SQLite in-memory for pytest suite). All primary keys use UUID v4, and timestamps follow UTC ISO 8601 format (compliant with Constitution Section 4.1).
- **Frontend Architecture:** React 18 SPA bundled with Vite, styled using Tailwind CSS, lucide-react icons, and react-router-dom for navigation (compliant with Constitution Section 4.2). API requests handled via Axios configured with `VITE_API_BASE_URL`.
- **API Contracts:** RESTful endpoints under `/api/v1/` (`/auth`, `/books`, `/loans`, `/users`). Automatic OpenAPI / Swagger UI interactive documentation available at `/docs`.
- **CORS & Environment:** Backend main module configures `CORSMiddleware` supporting origins from `ALLOWED_ORIGINS` (defaulting to `http://localhost:5173`). `.env.example` provided for both client and server.

### Acceptance Criteria
- User Authentication and Role-Based Access Control (RBAC): JWT-based auth supporting Librarian and Member roles.
- Book Catalog Management (CRUD & Search): Complete catalog CRUD for Librarians and fuzzy search with pagination for Members.
- Borrowing and Return Workflow: Checkout/return operations, 14-day borrowing window, active loan limits (e.g., max 5 books), available copy tracking.
- Loan Renewal and Fine Calculation: Single renewal if no reservations, automatic overdue fine calculations ($0.50/day).
- Responsive Frontend Dashboard & Catalog UI: React SPA with Tailwind CSS, book search filters, loan history, and management controls.

### Backend Tasks
- None specified

### Frontend Tasks
- None specified

### Database Changes
Not yet authored.

### API Endpoints
- `POST /api/v1/auth/register` — Register new user account
- `POST /api/v1/auth/login` — Authenticate credentials & return JWT
- `GET /api/v1/auth/me` — Fetch current authenticated profile
- `GET /api/v1/books` — List & fuzzy search catalog (query, genre, skip, limit)
- `POST /api/v1/books` — Create new catalog entry (Librarian only)
- `GET /api/v1/books/{id}` — Get book details by ID
- `PUT /api/v1/books/{id}` — Update existing book entry (Librarian only)
- `DELETE /api/v1/books/{id}` — Delete book entry (blocked if active loans exist)
- `POST /api/v1/loans/checkout` — Checkout available book (Member only)
- `POST /api/v1/loans/return/{id}` — Return borrowed book & calculate fine
- `POST /api/v1/loans/renew/{id}` — Renew active loan (single renewal)
- `GET /api/v1/loans/my-loans` — Fetch user's active & past loans

### UI Components
Not yet authored.

### Test Coverage
Not yet authored.

### Deployment Notes
Not yet authored.
