# Attendance Management System

A robust, full-stack Attendance Management System that allows employees to record daily check-in and check-out events, enables managers to monitor attendance logs and approve manual entries, and provides HR administrators with automated reporting and analytics.

## Features

- **Employee Portal**: One-click Check-in / Check-out with real-time timestamp recording.
- **Attendance Dashboard**: Individual and team attendance history calendar views (Present, Absent, Late, Half-Day).
- **Manager & HR Portal**: Manual entry adjustments, exception approvals, and report generation.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Employees, Managers, and Admins.

---

## Server Setup & Usage

### Prerequisites

- Python 3.11+
- SQLite (for local development and testing)

### Installation

1. Clone the repository and navigate to the project root.
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r server/requirements.txt
   ```

### Running the Server

Start the development server using Uvicorn from the **repo root**:
```bash
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

The API documentation will be available at `http://localhost:8000/docs`.

### Running Tests

Run the test suite using pytest:
```bash
pytest
```

---

## Test Credentials

The database is automatically seeded with the following ready-to-use test accounts:

- **Regular Employee**:
  - **Email**: `test@example.com`
  - **Password**: `testpassword`
  - **Role**: `Employee`
- **Manager**:
  - **Email**: `manager@example.com`
  - **Password**: `managerpassword`
  - **Role**: `Manager`
- **HR Admin**:
  - **Email**: `admin@example.com`
  - **Password**: `adminpassword`
  - **Role**: `Admin`

---

## Full-Stack Local Development

To run both the backend and frontend together:

1. **Backend**:
   - Follow the instructions in the [Server Setup & Usage](#server-setup--usage) section.
   - The backend runs on port `8000`.

2. **Frontend**:
   - Navigate to the `client/` directory.
   - Install dependencies: `npm install`
   - Start the Vite development server: `npm run dev`
   - The frontend runs on port `5173`.
