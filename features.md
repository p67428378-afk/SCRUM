# Project Features

## SCRUM-51 — Library Management System - Catalog, Borrowing, User Management, and Admin Analytics

### Feature Summary
Library Management System - Catalog, Borrowing, User Management, and Admin Analytics

### User Stories
# Library Management System - Catalog, Borrowing, User Management, and Admin Analytics

**Objective:**
Provide a comprehensive full-stack library management system that enables librarians to manage catalog items, borrowing transactions, and view data-driven analytics for purchasing and inventory decisions, while allowing members to search books, reserve titles, and track loan status.
This platform streamlines library operations, automates due-date tracking and fine calculations, and delivers interactive visual analytics panels alongside self-service user portals.

**Key Features:**
- Role-based authentication and user portal for Members and Librarians.
- Catalog management supporting book creation, updates, categorization, and search.
- Borrowing and return workflow with automatic inventory updates and due date tracking.
- Fine calculation and renewal mechanisms for active loans.
- Interactive user dashboard showing current loans, borrowing history, and saved titles.
- Admin purchasing & inventory analytics dashboard with interactive chart visualizations (Recharts / Chart.js) for popular genres, turn-around rates, active members, and total fines.

**Description:**
As a Library Administrator / Member,
I want a centralized, web-based Library Management System with admin analytics and reporting data,
So that librarians can efficiently manage book inventory, make informed purchasing and inventory decisions, and members can seamlessly search, borrow, and track books.

**Acceptance Criteria:**

- **User Authentication and Role-Based Access Control (RBAC):**
  - **Explanation:** The system must support JWT-based authentication with two distinct roles: `Librarian` (admin access to manage inventory, view all loans, oversee fines, and access `/api/v1/admin/analytics`) and `Member` (standard access to search catalog, borrow/reserve books, view personal history).
  - **Example:** A user logs in at `/api/v1/auth/login` with valid credentials. Upon successful authentication, a JWT access token containing role claims is returned and stored in frontend state to gate protected routes (`/admin`, `/admin/analytics` vs `/dashboard`).
  - **Edge Cases:** Expired tokens automatically trigger a refresh attempt via `/api/v1/auth/refresh` or redirect the user to login with an error message if invalid. Accessing `/api/v1/admin/analytics` with a Member token returns HTTP 403 Forbidden.

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

- **Admin Purchasing & Inventory Analytics API (`GET /api/v1/admin/analytics`):**
  - **Explanation:** The backend provides a dedicated REST endpoint `GET /api/v1/admin/analytics` accessible only to `Librarian` users. It returns aggregated metrics to support inventory management and book purchasing decisions:
    1. `most_popular_genres`: Top genres ranked by checkout frequency.
    2. `turn_around_rates`: Average loan turnover / return duration in days.
    3. `active_members_count`: Count of active borrowing members.
    4. `total_fines_collected`: Total value of collected overdue fines.
  - **Example:** A librarian makes a GET request to `/api/v1/admin/analytics`. The server aggregates borrowing data and returns HTTP 200 with structured JSON containing top genres, turnover rate, member count, and fine totals.
  - **Edge Cases:** Unauthenticated or unauthorized (`Member`) access returns HTTP 401 or 403. Databases with zero checkout records return empty genre lists and zero values without runtime exceptions.

- **Interactive Chart Visualization Panel in Librarian Portal (Recharts / Chart.js):**
  - **Explanation:** Embedded visualization panel within the Librarian portal using Recharts or Chart.js to render graphical charts (e.g., genre popularity bar charts, turn-around trend graphs) and key metric scorecards.
  - **Example:** A librarian opens the `/admin/analytics` panel in the React app, viewing a Recharts bar chart of popular genres to decide which categories need additional copy orders.
  - **Edge Cases:** API connection timeouts or errors trigger an error boundary UI with retry capabilities.

**Technical Requirements:**
- **Backend Architecture:** Python 3.11 with FastAPI and SQLAlchemy 2.x ORM targeting PostgreSQL database (SQLite in-memory for pytest suite). All primary keys use UUID v4, and timestamps follow UTC ISO 8601 format (compliant with Constitution Section 4.1). Includes SQL aggregation queries for admin analytics.
- **Frontend Architecture:** React 18 SPA bundled with Vite, styled using Tailwind CSS, lucide-react icons, Recharts / Chart.js for data visualization, and react-router-dom for navigation (compliant with Constitution Section 4.2). API requests handled via Axios configured with `VITE_API_BASE_URL`.
- **API Contracts:** RESTful endpoints under `/api/v1/` (`/auth`, `/books`, `/loans`, `/users`, `/admin/analytics`). Automatic OpenAPI / Swagger UI interactive documentation available at `/docs`.
- **CORS & Environment:** Backend main module configures `CORSMiddleware` supporting origins from `ALLOWED_ORIGINS` (defaulting to `http://localhost:5173`). `.env.example` provided for both client and server.

### Acceptance Criteria
- User Authentication and Role-Based Access Control (RBAC)
- Book Catalog Management (CRUD & Search)
- Borrowing and Return Workflow
- Loan Renewal and Fine Calculation
- Responsive Frontend Dashboard & Catalog UI
- Admin Purchasing & Inventory Analytics API (GET /api/v1/admin/analytics)
- Interactive Chart Visualization Panel in Librarian Portal (Recharts / Chart.js)

### Backend Tasks
- None specified

### Frontend Tasks
- None specified

### Database Changes
Not yet authored.

### API Endpoints
- `POST /api/v1/auth/register` — Register new user account [EXISTING]
- `POST /api/v1/auth/login` — Authenticate credentials & return JWT [EXISTING]
- `GET /api/v1/auth/me` — Fetch current authenticated profile [EXISTING]
- `GET /api/v1/books` — List & fuzzy search catalog (query, genre, skip, limit) [EXISTING]
- `POST /api/v1/books` — Create new catalog entry (Librarian only) [EXISTING]
- `GET /api/v1/books/{id}` — Get book details by ID [EXISTING]
- `PUT /api/v1/books/{id}` — Update existing book entry (Librarian only) [EXISTING]
- `DELETE /api/v1/books/{id}` — Delete book entry (blocked if active loans exist) [EXISTING]
- `POST /api/v1/loans/checkout` — Checkout available book (Member only) [EXISTING]
- `POST /api/v1/loans/return/{id}` — Return borrowed book & calculate fine [EXISTING]
- `POST /api/v1/loans/renew/{id}` — Renew active loan (single renewal) [EXISTING]
- `GET /api/v1/loans/my-loans` — Fetch user's active & past loans [EXISTING]
- `GET /api/v1/admin/analytics` — Computes and returns aggregated operational and inventory metrics for library purchasing decisions (Librarian only) [NEW]

### UI Components
Not yet authored.

### Test Coverage
Not yet authored.

### Deployment Notes
Not yet authored.
