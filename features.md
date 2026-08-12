# Project Features

## SCRUM-45 — Real-Time Long-Running Action Status Tracking & Execution Logs

### Feature Summary
Real-Time Long-Running Action Status Tracking & Execution Logs

### User Stories
# Real-Time Long-Running Action Status Tracking & Execution Logs

**Objective:**  
Provide users submitting long-running tasks with immediate UI state transitions, real-time status tracking, and step-by-step execution logs in an expandable terminal-style drawer.  
Ensure transparent error reporting, prolonged wait escalation alerts, live activity logging, and resilient session re-hydration across network reconnects and page refreshes.

**Key Features:**  
- Immediate Optimistic Processing State on Task Submission  
- Asynchronous Status API Endpoint & WebSocket/SSE Live Log Stream  
- Three-State Status Management (`pending`, `success`, `failed`)  
- Detailed Contextual Error Reason Display on Task Failure  
- Timed Escalation State Notification after 30 Seconds  
- Expandable "View Details" Terminal-Style Activity Drawer for Step-by-Step Execution Logs  
- Backend Timestamped Event Log Appending (`logs: [{ timestamp, level, message }]`)  
- Resilient Status Re-fetching and Session Persistence on Page Refresh/Reconnect  

**Description:**  
As a user who submits a long-running action (e.g., file upload, report generation, pipeline execution),  
I want to view real-time status updates along with live step-by-step execution logs in an expandable drawer,  
So that I have full visibility into background task processing progress and can diagnose delays or failures easily.

---

### **Acceptance Criteria:**

1. **Immediate Optimistic UI State:**
   - **Explanation:** The frontend UI transitions to a "processing" state synchronously upon triggering the submit action (e.g., button click / request initiation), before awaiting any asynchronous network or backend HTTP response, preventing the interface from appearing frozen.
   - **Example:** When a user clicks "Generate Report", the submit button immediately disables and displays "Processing request..." spinner instantly at t=0ms, prior to receiving the initial backend response.
   - **Edge Cases:** Rapid double-clicking on the submit button is debounced/blocked by the immediate UI state lock.

2. **Backend Multi-State Status Endpoint & Push Engine with Log Payload:**
   - **Explanation:** The backend service tracks and exposes long-running task states using a dedicated status endpoint (`GET /api/v1/tasks/{task_id}/status`) and/or WebSocket/SSE event push, supporting distinct states (`pending`, `success`, `failed`) along with an array of timestamped execution logs (`logs: [{ timestamp, level, message }]`).
   - **Example:** Polling `GET /api/v1/tasks/task-99881` returns `{"task_id": "task-99881", "status": "pending", "logs": [{"timestamp": "2026-08-12T10:00:00Z", "level": "INFO", "message": "Pipeline processing started"}], "updated_at": "2026-08-12T10:00:02Z"}`.
   - **Edge Cases:** Unauthorized status requests for a `task_id` owned by another user return HTTP 403 Forbidden.

3. **Real-Time UI Updates Without Page Reload:**
   - **Explanation:** The frontend subscribes via WebSocket / SSE or performs periodic polling (every 2-3 seconds) to receive live task progress updates and live event logs.
   - **Example:** While a pipeline task is in `pending` status, the frontend receives a status event transitioning it to `success` along with the final log entry.
   - **Edge Cases:** Network disconnects trigger exponential backoff auto-reconnect attempts.

4. **Detailed Error Reason Display on Failure:**
   - **Explanation:** If a task enters `failed` state, backend provides structured error code and explanation displayed explicitly in UI and logged in drawer.
   - **Example:** Display "Payment Failed: Credit card declined (Error Code: PAY_402)" and record `[ERROR] Task terminated: PAY_402` in log drawer.
   - **Edge Cases:** Malformed error payloads fall back to status code display.

5. **Prolonged Pending Escalation State (30-Second Threshold):**
   - **Explanation:** If task remains in `pending` status past 30s threshold, UI shifts to escalation banner.
   - **Example:** At t=30s, notification appears: "This is taking longer than usual..."
   - **Edge Cases:** Escalation banner replaced immediately upon state transition.

6. **Expandable "View Details" Terminal-Style Activity Log Drawer:**
   - **Explanation:** Expandable terminal-style drawer with monospaced font showing live execution logs with level styling.
   - **Example:** Clicking "View Details" opens drawer showing timestamped INFO/WARN/ERROR log lines.
   - **Edge Cases:** Auto-scroll pauses on manual upward scroll and resumes when scrolled back to bottom.

7. **Backend Timestamped Event Log Appending:**
   - **Explanation:** Background worker appends structured logs (`timestamp`, `level`, `message`) to task job payload.
   - **Example:** Worker appends `{"timestamp": "2026-08-12T10:00:05Z", "level": "INFO", "message": "Database transaction committed"}`.
   - **Edge Cases:** Max limit of 1,000 log lines per task; excess logs stored in DB and paginated on API.

8. **Reconnect & Refresh Session Persistence:**
   - **Explanation:** Reads `task_id` from local storage/URL on refresh/reconnect to re-hydrate state and log feed.
   - **Example:** Refreshing browser restores processing view and populates terminal drawer with historical logs.
   - **Edge Cases:** HTTP 404 if `task_id` expired.

### Acceptance Criteria
- 1. Immediate Optimistic UI State
- 2. Backend Multi-State Status Endpoint & Push Engine with Log Payload
- 3. Real-Time UI Updates Without Page Reload
- 4. Detailed Error Reason Display on Failure
- 5. Prolonged Pending Escalation State (30-Second Threshold)
- 6. Expandable 'View Details' Terminal-Style Activity Log Drawer
- 7. Backend Timestamped Event Log Appending
- 8. Reconnect & Refresh Session Persistence

### Backend Tasks
- None specified

### Frontend Tasks
- None specified

### Database Changes
Not yet authored.

### API Endpoints
- `POST /api/v1/tasks` — Submit long-running task (returns 202 Accepted) [EXISTING]
- `GET /api/v1/tasks/{task_id}/status` — Fetch task status and logs array [MODIFIED]
- `WS /api/v1/ws/tasks/{task_id}` — WebSocket endpoint streaming live status and log updates [MODIFIED]

### UI Components
Not yet authored.

### Test Coverage
Not yet authored.

### Deployment Notes
Not yet authored.
