"""
Module: routers.bus_tracking
Purpose: FastAPI router for routes, stops, buses, telemetry, ETAs, alerts, and WebSockets
"""

import math
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.app.database import get_db
from server.app.models.bus_tracking import (
    Route,
    Stop,
    RouteStop,
    Bus,
    Alert,
    TelemetryLog,
)
from server.app.schemas.bus_tracking import (
    RouteResponse,
    RouteDetailResponse,
    RouteCreate,
    StopResponse,
    StopCreate,
    BusResponse,
    BusCreate,
    TelemetryIngest,
    StopETASummary,
    ETACalculation,
    AlertCreate,
    AlertResponse,
)

router = APIRouter(prefix="/api/v1", tags=["Bus Tracking"])


def current_utc_time():
    return datetime.now(timezone.utc)


def calculate_haversine_miles(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Calculate distance in miles between two lat/lon coordinates."""
    R = 3958.8  # Earth radius in miles
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


ws_manager = ConnectionManager()


def check_bus_stale_status(bus: Bus) -> bool:
    """Check if bus telemetry is stale (older than 30 seconds)."""
    if not bus.last_seen_at:
        return True
    last_seen = bus.last_seen_at
    if last_seen.tzinfo is None:
        last_seen = last_seen.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    return (now - last_seen).total_seconds() > 30


def format_bus_response(bus: Bus) -> BusResponse:
    is_stale = check_bus_stale_status(bus)
    status_str = "Offline/Stale" if is_stale else (bus.status or "Active")
    route_name = bus.route.name if bus.route else None
    return BusResponse(
        id=bus.id,
        bus_number=bus.bus_number,
        license_plate=bus.license_plate,
        route_id=bus.route_id,
        driver_name=bus.driver_name,
        status=status_str,
        latitude=bus.latitude,
        longitude=bus.longitude,
        speed_mph=bus.speed_mph or 0.0,
        heading=bus.heading or 0.0,
        last_seen_at=bus.last_seen_at,
        is_stale=is_stale,
        route_name=route_name,
        created_at=bus.created_at,
        updated_at=bus.updated_at,
    )


# ---------------- Routes ----------------
@router.get("/routes", response_model=List[RouteResponse])
def list_routes(
    q: Optional[str] = Query(None, description="Search by route name or code"),
    db: Session = Depends(get_db),
):
    query = db.query(Route).filter(Route.is_active == True)
    if q:
        query = query.filter(
            or_(
                Route.name.ilike(f"%{q}%"),
                Route.code.ilike(f"%{q}%"),
            )
        )
    return query.all()


@router.get("/routes/{route_id}", response_model=RouteDetailResponse)
def get_route_details(route_id: str, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Route not found"
        )
    active_buses = [format_bus_response(b) for b in route.buses]
    return RouteDetailResponse(
        id=route.id,
        name=route.name,
        code=route.code,
        description=route.description,
        path_geojson=route.path_geojson,
        is_active=route.is_active,
        created_at=route.created_at,
        updated_at=route.updated_at,
        route_stops=route.route_stops,
        active_buses=active_buses,
    )


@router.post(
    "/routes", response_model=RouteResponse, status_code=status.HTTP_201_CREATED
)
def create_route(route_in: RouteCreate, db: Session = Depends(get_db)):
    existing = db.query(Route).filter(Route.code == route_in.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Route code '{route_in.code}' already exists",
        )
    route = Route(
        name=route_in.name,
        code=route_in.code,
        description=route_in.description,
        path_geojson=route_in.path_geojson,
        is_active=route_in.is_active,
    )
    db.add(route)
    db.flush()

    if route_in.stops:
        for item in route_in.stops:
            stop = db.query(Stop).filter(Stop.id == item.stop_id).first()
            if stop:
                rs = RouteStop(
                    route_id=route.id,
                    stop_id=stop.id,
                    stop_order=item.stop_order,
                    estimated_time_offset_minutes=item.estimated_time_offset_minutes
                    or 0,
                )
                db.add(rs)

    db.commit()
    db.refresh(route)
    return route


@router.delete("/routes/{route_id}", status_code=status.HTTP_200_OK)
def delete_route(route_id: str, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Route not found"
        )

    # Check for active assigned buses
    assigned_buses = db.query(Bus).filter(Bus.route_id == route_id).all()
    if assigned_buses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete route with active assigned buses. Reassign or remove buses first.",
        )

    db.delete(route)
    db.commit()
    return {"message": f"Route '{route.name}' deleted successfully."}


# ---------------- Stops ----------------
@router.get("/stops/search", response_model=List[StopResponse])
def search_stops(
    q: str = Query(
        ..., min_length=1, description="Autocomplete query for stop name or address"
    ),
    db: Session = Depends(get_db),
):
    stops = (
        db.query(Stop)
        .filter(
            or_(
                Stop.name.ilike(f"%{q}%"),
                Stop.address.ilike(f"%{q}%"),
            )
        )
        .all()
    )
    return stops


@router.get("/stops", response_model=List[StopResponse])
def list_stops(db: Session = Depends(get_db)):
    return db.query(Stop).all()


@router.post("/stops", response_model=StopResponse, status_code=status.HTTP_201_CREATED)
def create_stop(stop_in: StopCreate, db: Session = Depends(get_db)):
    stop = Stop(
        name=stop_in.name,
        address=stop_in.address,
        latitude=stop_in.latitude,
        longitude=stop_in.longitude,
    )
    db.add(stop)
    db.commit()
    db.refresh(stop)
    return stop


@router.get("/stops/{stop_id}/eta", response_model=StopETASummary)
def get_stop_eta(stop_id: str, db: Session = Depends(get_db)):
    stop = db.query(Stop).filter(Stop.id == stop_id).first()
    if not stop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Stop not found"
        )

    # Find routes serving this stop
    route_ids = [rs.route_id for rs in stop.route_stops]
    buses = (
        db.query(Bus).filter(Bus.route_id.in_(route_ids)).all()
        if route_ids
        else db.query(Bus).all()
    )

    approaching: List[ETACalculation] = []
    for bus in buses:
        if bus.latitude is None or bus.longitude is None:
            continue

        is_stale = check_bus_stale_status(bus)
        distance = calculate_haversine_miles(
            bus.latitude, bus.longitude, stop.latitude, stop.longitude
        )

        # Average speed fallback: 20 mph if stationary/stale
        effective_speed = (
            bus.speed_mph if (bus.speed_mph and bus.speed_mph > 5) else 20.0
        )
        eta_hours = distance / effective_speed
        eta_minutes = round(eta_hours * 60, 1)

        if is_stale:
            status_desc = "Offline/Stale"
            arrival_msg = (
                f"Bus #{bus.bus_number} signal lost ({distance:.1f} miles away)"
            )
        elif distance < 0.1:
            status_desc = "Arriving Now"
            arrival_msg = f"Bus #{bus.bus_number} arriving now at {stop.name}"
        else:
            status_desc = "On Time"
            arrival_msg = f"Bus #{bus.bus_number} arriving in {int(eta_minutes)} minutes ({distance:.1f} miles away)"

        approaching.append(
            ETACalculation(
                bus_id=bus.id,
                bus_number=bus.bus_number,
                route_id=bus.route_id,
                route_name=bus.route.name if bus.route else None,
                distance_miles=round(distance, 2),
                eta_minutes=eta_minutes,
                arrival_message=arrival_msg,
                status=status_desc,
            )
        )

    # Sort by ETA
    approaching.sort(key=lambda x: x.eta_minutes)
    return StopETASummary(
        stop_id=stop.id,
        stop_name=stop.name,
        approaching_buses=approaching,
    )


# ---------------- Buses & Telemetry ----------------
@router.get("/buses", response_model=List[BusResponse])
def list_buses(db: Session = Depends(get_db)):
    buses = db.query(Bus).all()
    return [format_bus_response(b) for b in buses]


@router.post("/buses", response_model=BusResponse, status_code=status.HTTP_201_CREATED)
def create_bus(bus_in: BusCreate, db: Session = Depends(get_db)):
    existing = db.query(Bus).filter(Bus.bus_number == bus_in.bus_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bus number '{bus_in.bus_number}' already exists",
        )
    bus = Bus(
        bus_number=bus_in.bus_number,
        license_plate=bus_in.license_plate,
        route_id=bus_in.route_id,
        driver_name=bus_in.driver_name,
        status=bus_in.status or "Active",
        latitude=bus_in.latitude,
        longitude=bus_in.longitude,
        last_seen_at=current_utc_time(),
    )
    db.add(bus)
    db.commit()
    db.refresh(bus)
    return format_bus_response(bus)


@router.post("/buses/telemetry", response_model=BusResponse)
async def ingest_telemetry(data: TelemetryIngest, db: Session = Depends(get_db)):
    bus = db.query(Bus).filter(Bus.id == data.bus_id).first()
    if not bus:
        # Try searching by bus_number as fallback
        bus = db.query(Bus).filter(Bus.bus_number == data.bus_id).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bus not found"
        )

    now = current_utc_time()
    bus.latitude = data.latitude
    bus.longitude = data.longitude
    bus.speed_mph = data.speed_mph or 0.0
    bus.heading = data.heading or 0.0
    bus.last_seen_at = now
    bus.status = "Active"

    # Save log entry
    log = TelemetryLog(
        bus_id=bus.id,
        latitude=data.latitude,
        longitude=data.longitude,
        speed_mph=bus.speed_mph,
        timestamp=now,
    )
    db.add(log)

    # Evaluate registered alerts
    alerts = (
        db.query(Alert)
        .filter(Alert.bus_id == bus.id, Alert.is_triggered == False)
        .all()
    )
    for alert in alerts:
        if alert.stop_id and alert.stop:
            dist = calculate_haversine_miles(
                data.latitude, data.longitude, alert.stop.latitude, alert.stop.longitude
            )
            if dist <= (alert.threshold_miles or 1.0):
                alert.is_triggered = True
                alert.message = f"Alert Triggered! Bus #{bus.bus_number} is {dist:.2f} miles from {alert.stop.name}."

    db.commit()
    db.refresh(bus)

    res = format_bus_response(bus)

    # Broadcast via WebSocket
    await ws_manager.broadcast(
        {
            "event": "location_update",
            "bus_id": bus.id,
            "bus_number": bus.bus_number,
            "latitude": bus.latitude,
            "longitude": bus.longitude,
            "speed_mph": bus.speed_mph,
            "status": res.status,
            "last_seen_at": bus.last_seen_at.isoformat() if bus.last_seen_at else None,
        }
    )

    return res


# ---------------- Alerts ----------------
@router.post(
    "/alerts", response_model=AlertResponse, status_code=status.HTTP_201_CREATED
)
def create_alert(alert_in: AlertCreate, db: Session = Depends(get_db)):
    alert = Alert(
        user_email=alert_in.user_email,
        bus_id=alert_in.bus_id,
        stop_id=alert_in.stop_id,
        threshold_minutes=alert_in.threshold_minutes,
        threshold_miles=alert_in.threshold_miles,
        is_triggered=False,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.get("/alerts", response_model=List[AlertResponse])
def list_alerts(user_email: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if user_email:
        query = query.filter(Alert.user_email == user_email)
    return query.all()


# ---------------- WebSocket ----------------
@router.websocket("/ws/bus-locations")
async def websocket_bus_locations(websocket: WebSocket, db: Session = Depends(get_db)):
    await ws_manager.connect(websocket)
    try:
        # Send initial snapshot of all buses
        buses = db.query(Bus).all()
        snapshot = [format_bus_response(b).model_dump(mode="json") for b in buses]
        await websocket.send_json({"event": "initial_snapshot", "buses": snapshot})

        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
