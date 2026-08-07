# Project Features

## SCRUM-28 — Library Management System

### Feature Summary
Library Management System

### User Stories
# Library Management System

**Objective:**
Provide a centralized system for managing book catalogs, patron memberships, borrow/return workflows, and overdue fine tracking.
Streamline library operations, improve inventory accuracy, and enhance user experience for both patrons and librarians.

**Key Features:**
- Book Catalog Management: Add, update, search, and view books with ISBN and availability status.
- Patron Management: Register patrons, manage profiles, and track active loans/fines.
- Borrow & Return Workflows: Check out books, calculate due dates, and process returns.
- Fine & Overdue Calculations: Automatically calculate late fees and manage payment status.
- Role-Based Access Control: Granular permissions for Librarians and Patrons.

**Description:**
As a Library Administrator / Patron,
I want a comprehensive Library Management System to manage catalog inventory, patron accounts, borrow/return transactions, and fines,
So that library operations are automated, inventory is accurately tracked, and borrowing processes are seamless.

**Acceptance Criteria:**

- **Book Catalog & Search:** Users can search books by title, author, category, or ISBN. Librarians can add, edit, and update book availability status (Available, Borrowed, Maintenance).
  - **Example:** Searching "Python Programming" displays available copies, location, and borrowing status.
  - **Edge Cases:** Attempting to borrow a book marked as "Borrowed" or "Maintenance" returns a clear error.

- **Patron Management & Registration:** Librarians can register new patrons with unique IDs, contact details, and account status (Active, Suspended).
  - **Example:** Registering a new patron creates a profile with a 0 active loan balance and "Active" status.
  - **Edge Cases:** Registering a patron with an existing email or ID produces a validation error.

- **Borrow & Return Workflows:** Patrons can check out up to 5 books at a time for a default duration of 14 days. Returns update book availability instantly.
  - **Example:** Borrowing a book on June 1 sets the due date to June 15 and marks the book status as "Borrowed".
  - **Edge Cases:** Attempting to check out a 6th book when 5 active loans exist blocks checkout with a limit reached notification.

- **Fine & Overdue Tracking:** The system calculates fines for overdue books at $0.50 per day past the due date until returned.
  - **Example:** Returning a book 3 days late incurs a $1.50 fine added to the patron's account balance.
  - **Edge Cases:** Unpaid fines exceeding $10.00 temporarily suspend checkout privileges.

- **Role-Based Access Control:** Patrons can view catalogs and personal loan history; Librarians have full CRUD permissions over inventory, patron accounts, and fine adjustments.
  - **Example:** A patron logging in sees search and "My Loans", but cannot access the "Add Book" interface.
  - **Edge Cases:** Direct API requests to administrative endpoints by non-librarian roles return HTTP 403 Forbidden.

**Technical Requirements:**
- Reference external systems, APIs, or databases involved: PostgreSQL DB with SQLAlchemy 2.x ORM, FastAPI REST endpoints (`/api/v1/books`, `/api/v1/patrons`, `/api/v1/loans`, `/api/v1/fines`), React 18 / Tailwind CSS frontend.
- Consider edge cases, potential errors, and system handling: Database transactions for checkout to prevent race conditions; proper HTTP status codes and error responses (400, 403, 404, 422, 500).

### Acceptance Criteria
- Book Catalog & Search: Users can search books by title, author, category, or ISBN. Librarians can add, edit, and update book availability status (Available, Borrowed, Maintenance).
- Patron Management & Registration: Librarians can register new patrons with unique IDs, contact details, and account status (Active, Suspended).
- Borrow & Return Workflows: Patrons can check out up to 5 books at a time for a default duration of 14 days. Returns update book availability instantly.
- Fine & Overdue Tracking: The system calculates fines for overdue books at $0.50 per day past the due date until returned.
- Role-Based Access Control: Patrons can view catalogs and personal loan history; Librarians have full CRUD permissions over inventory, patron accounts, and fine adjustments.

### Backend Tasks
- None specified

### Frontend Tasks
- None specified

### Database Changes
Not yet authored.

### API Endpoints
- `POST /api/v1/auth/login` — Authenticate user and return JWT bearer token
- `POST /api/v1/auth/register` — Register new user account
- `GET /api/v1/books` — Search book catalog with query parameters (query, category, status, skip, limit)
- `POST /api/v1/books` — Create a new book record (Librarian only)
- `PUT /api/v1/books/{id}` — Update book details or availability status (Librarian only)
- `DELETE /api/v1/books/{id}` — Remove a book from the catalog (Librarian only)
- `GET /api/v1/patrons` — List patrons with filter criteria (status, search) (Librarian only)
- `GET /api/v1/patrons/{id}` — Get patron details, active loan count, and unpaid fine balance
- `POST /api/v1/loans/checkout` — Check out a book (validates 5-book limit, $10 fine limit, and availability)
- `POST /api/v1/loans/{id}/return` — Process book return, update availability, and calculate overdue fines
- `GET /api/v1/loans/my-loans` — List current and historical loans for the authenticated patron
- `GET /api/v1/fines` — View all overdue fines ledger (Librarian only)
- `POST /api/v1/fines/{id}/pay` — Record fine payment and update patron balance/status

### UI Components
Not yet authored.

### Test Coverage
Not yet authored.

### Deployment Notes
Not yet authored.
