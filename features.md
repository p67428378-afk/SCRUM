# Project Features

## SCRUM-42 — Real-Time Bus Tracking Application

### Feature Summary
Real-Time Bus Tracking Application

### User Stories
# Real-Time Bus Tracking Application

**Objective:**
The Real-Time Bus Tracking Application provides passengers and transit operators with live bus geolocation, route schedules, and estimated arrival times (ETA).
By leveraging real-time GPS telemetry and interactive mapping, the system reduces passenger waiting times and improves public transit operational efficiency.

**Key Features:**
- Interactive map view displaying live bus locations, markers, and active transit routes.
- Real-time location streaming via WebSockets with fallback REST polling.
- Search capabilities for routes, stops, and destinations with arrival predictions (ETA).
- Passenger proximity alerts and arrival notifications.
- Admin panel for managing routes, stop coordinates, and bus fleet assignments.

**Description:**
As a transit passenger,  
I want to view live bus locations, routes, and arrival predictions on an interactive map,  
So that I can plan my travel efficiently and minimize waiting time at bus stops.

**Acceptance Criteria:**

- **Live Bus Location Map View:** The application must display an interactive map showing real-time GPS positions of active buses along selected transit routes.
  - **Example:** A passenger selects Route 101 on the map, and bus markers update their positions every 5 seconds without requiring page refreshes.
  - **Edge Cases:** If GPS telemetry signal from a bus is lost for over 30 seconds, mark the bus as "Offline/Stale" with a dimmed icon on the map.

- **Estimated Arrival Time (ETA) Calculation:** The system must calculate and update ETA for upcoming bus stops based on route schedules, live speed, and spatial proximity.
  - **Example:** Selecting "Main St & 5th Ave" stop displays "Bus #42 arriving in 4 minutes (0.8 miles away)".
  - **Edge Cases:** Severe traffic delays or unexpected rerouting automatically recalculates the ETA and flags a delay status on the stop details view.

- **Route & Stop Search:** Passengers must be able to search for specific bus routes, stop names, or destination addresses with autocomplete support.
  - **Example:** Typing "Central Station" into the search bar filters the route list to all lines stopping at Central Station and centers the map view on the transit hub.
  - **Edge Cases:** If no matching stops or routes are found, display a clear empty state message with suggestions for nearby stops.

- **Proximity & Arrival Alerts:** Passengers can enable web push or browser notifications when a selected bus is within a specified distance or time threshold from their stop.
  - **Example:** A user sets an alert for 5 minutes before Bus #12 arrives at "Oak Street", receiving a notification banner when triggered.
  - **Edge Cases:** If browser notification permissions are denied, gracefully inform the user and display in-app toast alerts instead.

- **Admin Fleet & Route Management:** Authorized transit admins must have a dashboard to manage bus fleets, driver assignments, route paths, and stop coordinates.
  - **Example:** An admin creates a new route "Route 202 - Express", defines 8 stop locations on the map, and assigns Bus #15 to the schedule.
  - **Edge Cases:** Attempting to delete a route with active assigned buses prompts a confirmation error requiring re-assignment before deletion.

**Technical Requirements:**
- **Backend Architecture:** Python 3.11 / FastAPI service with RESTful endpoints (`/api/v1/routes`, `/api/v1/stops`, `/api/v1/buses`) conforming to Project Constitution Section 4.1.
- **Real-Time Communication:** Secure WebSocket endpoint (`wss:///api/v1/ws/bus-locations`) for streaming real-time vehicle coordinates to active clients.
- **Frontend Layer:** React 18 with Vite, Tailwind CSS, and Leaflet/Mapbox GL for responsive map rendering and smooth vehicle marker animation.
- **Database Layer:** PostGIS-enabled PostgreSQL database for spatial indexing (`ST_DWithin`, `ST_Distance`) and GTFS / GTFS-RT standard data modeling.
- **Security & Integration:** JWT authentication for driver/admin routes, CORS middleware enabled for client origins (`http://localhost:5173`), and automatic WebSocket reconnect logic.

### Acceptance Criteria
- Live Bus Location Map View: Interactive map showing real-time GPS positions updating every 5 seconds; lost signal >30s marks bus as Offline/Stale.
- Estimated Arrival Time (ETA) Calculation: Calculate/update ETA based on schedules, speed, spatial proximity; auto-recalculate on delays.
- Route & Stop Search: Autocomplete search for routes, stop names, destination addresses; clear empty state if no results.
- Proximity & Arrival Alerts: Web push / browser notifications or in-app toast alerts based on distance/time thresholds.
- Admin Fleet & Route Management: Dashboard to manage bus fleets, driver assignments, route paths, stop coordinates with deletion checks.

### Backend Tasks
- server/main.py
- server/models.py

### Frontend Tasks
- client/src/main.jsx
- client/src/App.jsx

### Database Changes
Not yet authored.

### API Endpoints
- `GET /api/v1/routes` — List all active transit routes with path GeoJSON
- `GET /api/v1/routes/{route_id}` — Get route details, stops, and active assigned buses
- `POST /api/v1/routes` — Create new transit route and path points
- `DELETE /api/v1/routes/{route_id}` — Delete route (requires 0 active assigned buses)
- `GET /api/v1/stops/search` — Autocomplete search for stops by name/address
- `GET /api/v1/stops/{stop_id}/eta` — Get live ETA calculations for buses approaching stop
- `GET /api/v1/buses` — Get current positions and status of all buses
- `POST /api/v1/buses/telemetry` — Ingest GPS location telemetry from bus devices
- `POST /api/v1/alerts` — Subscribe to arrival/proximity notifications

### UI Components
Not yet authored.

### Test Coverage
Not yet authored.

### Deployment Notes
Not yet authored.
