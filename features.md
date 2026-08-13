# Project Features

## SCRUM-56 — Hotel Management System - Core Booking, Room & Guest Operations

### Feature Summary
Hotel Management System - Core Booking, Room & Guest Operations

### User Stories
# Hotel Management System - Core Booking, Room & Guest Operations

**Objective:**
A full-stack Hotel Management System designed to streamline room reservations, guest check-in/check-out processes, and inventory tracking.
It empowers hotel staff to manage daily operations efficiently while providing guests with seamless booking and billing experiences.

**Key Features:**
- Room Inventory & Status Management (availability, room types, pricing tiers, cleaning status).
- Guest Profile & Reservation Engine (booking creation, modification, cancellation, and guest history).
- Check-in & Check-out Workflow (automated billing, folio generation, payment processing, and key management).
- Staff Dashboard & Reporting (occupancy rates, revenue metrics, daily operational summary).

**Description:**
As a Hotel Administrator and Front Desk Operations Manager,
I want to manage room inventory, process guest reservations, handle seamless check-in and check-out workflows, and track room availability in real-time,
So that I can maximize hotel occupancy, streamline operational efficiency, eliminate double-booking errors, and deliver an exceptional guest experience.

**Acceptance Criteria:**

- **Room Inventory and Rate Management:** The system shall support creating, updating, and categorizing rooms by type (e.g., Standard, Deluxe, Suite), capacity, nightly rate, and current status (e.g., Available, Occupied, Cleaning, Maintenance).
- **Example:** An administrator creates a Deluxe Room with a base rate of $150/night, 2-guest capacity, and initial status 'Available'. The room immediately appears in search results for matching dates.

- **Reservation and Booking Lifecycle:** The system shall allow front desk staff and guests to search room availability by date range and guest count, create bookings with guest details, modify reservation dates or room types, and cancel bookings with status tracking (e.g., Confirmed, Checked-In, Checked-Out, Cancelled).
- **Example:** A guest books a Deluxe Room from Oct 10 to Oct 15. The system locks those dates for room #204, calculates total cost ($750 + tax), and sets status to 'Confirmed'. Attempting to book room #204 for overlapping dates (Oct 12-14) is blocked with an error.

- **Check-in and Check-out Workflows:** The system shall support one-click check-in for confirmed reservations on arrival date, assignment of room keys, and automated check-out processing that compiles room charges, amenities, and taxes into a consolidated folio with receipt generation.
- **Example:** During check-in, staff verifies guest ID and clicks 'Check-In'. Room #204 status transitions from 'Available' to 'Occupied'. Upon check-out, the system produces an itemized bill, processes payment confirmation, and updates room status to 'Cleaning'.

- **Staff Dashboard and Occupancy Analytics:** The system shall provide a real-time operational dashboard displaying current occupancy percentage, daily arrivals/departures, rooms requiring housekeeping, and total daily revenue.
- **Example:** On opening the dashboard, staff sees 85% occupancy, 12 pending check-ins, 8 scheduled check-outs, and 5 rooms flagged for 'Cleaning'.

- **Role-Based Access Control and Security:** The system shall enforce role-based access (Admin, Front Desk Staff, Housekeeping) to protect sensitive guest personal data (PII) and financial transaction logs.
- **Example:** Housekeeping staff can view and update room cleaning statuses but cannot view guest credit card data or modify room pricing rates.

**Technical Requirements:**
- **Backend API:** Built using FastAPI (Python 3.11) with RESTful endpoints (`/api/v1/rooms`, `/api/v1/reservations`, `/api/v1/guests`, `/api/v1/dashboard`).
- **Database Schema:** PostgreSQL (SQLite for testing) using SQLAlchemy 2.x with UUID primary keys and ISO 8601 timestamps (`created_at`, `updated_at`). Tables include `rooms`, `guests`, `reservations`, and `folios`.
- **Frontend UI:** Built using React 18, Vite, and Tailwind CSS. Responsive dashboards for desktop front desk use and mobile-friendly views for housekeeping staff.
- **Security & Compliance:** Token-based authentication (JWT), RBAC middleware, CORS configured for `http://localhost:5173`, and input validation using Pydantic / Zod.
- **CORS & Environment Setup:** Standardized `.env.example` at root, CORS enabled for frontend Vite dev server, and health check endpoint at `/health`.

### Acceptance Criteria
- Room Inventory and Rate Management: Support creating, updating, and categorizing rooms by type, capacity, nightly rate, and current status.
- Reservation and Booking Lifecycle: Search room availability by date range and guest count, create bookings with guest details, modify reservation dates or room types, and cancel bookings with status tracking.
- Check-in and Check-out Workflows: Support one-click check-in for confirmed reservations on arrival date, assignment of room keys, and automated check-out processing with consolidated folio generation.
- Staff Dashboard and Occupancy Analytics: Real-time operational dashboard displaying current occupancy percentage, daily arrivals/departures, rooms requiring housekeeping, and total daily revenue.
- Role-Based Access Control and Security: Enforce role-based access (Admin, Front Desk Staff, Housekeeping) to protect sensitive guest PII and financial transaction logs.

### Backend Tasks
- None specified

### Frontend Tasks
- None specified

### Database Changes
Not yet authored.

### API Endpoints
- `POST /api/v1/auth/login` — OAuth2 password flow login returning JWT access token
- `GET /api/v1/rooms` — Search and list rooms by type, status, and capacity
- `POST /api/v1/rooms` — Create a new room in inventory (Admin only)
- `GET /api/v1/reservations/availability` — Check room availability for date range and guest capacity
- `POST /api/v1/reservations` — Create a new booking reservation
- `POST /api/v1/folios/{reservation_id}/check-in` — Initiate guest check-in, assign key, and initialize folio
- `POST /api/v1/folios/{reservation_id}/check-out` — Process check-out payment settlement and update room status to Cleaning
- `GET /api/v1/dashboard/metrics` — Get aggregated occupancy percentage, daily arrivals/departures, and housekeeping counts

### UI Components
Not yet authored.

### Test Coverage
Not yet authored.

### Deployment Notes
Not yet authored.
