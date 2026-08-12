"""
Module: schemas.bus_tracking
Purpose: Pydantic schemas for Bus Tracking API requests and responses
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# Stop Schemas
class StopBase(BaseModel):
    name: str
    address: Optional[str] = None
    latitude: float
    longitude: float


class StopCreate(StopBase):
    pass


class StopResponse(StopBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# RouteStop Schemas
class RouteStopCreate(BaseModel):
    stop_id: str
    stop_order: int
    estimated_time_offset_minutes: Optional[int] = 0


class RouteStopResponse(BaseModel):
    id: str
    stop_id: str
    stop_order: int
    estimated_time_offset_minutes: int
    stop: Optional[StopResponse] = None

    model_config = ConfigDict(from_attributes=True)


# Route Schemas
class RouteBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    path_geojson: Optional[str] = None
    is_active: Optional[bool] = True


class RouteCreate(RouteBase):
    stops: Optional[List[RouteStopCreate]] = []


class RouteResponse(RouteBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Bus Schemas
class BusBase(BaseModel):
    bus_number: str
    license_plate: Optional[str] = None
    route_id: Optional[str] = None
    driver_name: Optional[str] = None


class BusCreate(BusBase):
    status: Optional[str] = "Active"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BusResponse(BusBase):
    id: str
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    speed_mph: float
    heading: float
    last_seen_at: Optional[datetime] = None
    is_stale: bool = False
    route_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TelemetryIngest(BaseModel):
    bus_id: str
    latitude: float
    longitude: float
    speed_mph: Optional[float] = 0.0
    heading: Optional[float] = 0.0
    timestamp: Optional[datetime] = None


# Detailed Route Response with Stops and Assigned Buses
class RouteDetailResponse(RouteResponse):
    route_stops: List[RouteStopResponse] = []
    active_buses: List[BusResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ETA Calculation Schemas
class ETACalculation(BaseModel):
    bus_id: str
    bus_number: str
    route_id: Optional[str] = None
    route_name: Optional[str] = None
    distance_miles: float
    eta_minutes: float
    arrival_message: str
    status: str  # e.g., "On Time", "Delayed", "Offline/Stale"


class StopETASummary(BaseModel):
    stop_id: str
    stop_name: str
    approaching_buses: List[ETACalculation]


# Alert Schemas
class AlertCreate(BaseModel):
    user_email: str
    bus_id: Optional[str] = None
    stop_id: Optional[str] = None
    threshold_minutes: Optional[int] = 5
    threshold_miles: Optional[float] = 1.0


class AlertResponse(BaseModel):
    id: str
    user_email: str
    bus_id: Optional[str] = None
    stop_id: Optional[str] = None
    threshold_minutes: Optional[int] = 5
    threshold_miles: Optional[float] = 1.0
    is_triggered: bool
    message: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
