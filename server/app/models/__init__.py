"""
Module: models
Purpose: Import all models to register them on Base.metadata
"""

from server.app.database import Base
from server.app.models.resident import Resident, FamilyMember
from server.app.models.maintenance import MaintenanceRequest
from server.app.models.payment import Bill, Payment
from server.app.models.communication import Announcement, Discussion, Comment
from server.app.models.facility import Facility, Booking
from server.app.models.visitor import Visitor
from server.app.models.bus_tracking import (
    Route,
    Stop,
    RouteStop,
    Bus,
    Alert,
    TelemetryLog,
)

__all__ = [
    "Base",
    "Resident",
    "FamilyMember",
    "MaintenanceRequest",
    "Bill",
    "Payment",
    "Announcement",
    "Discussion",
    "Comment",
    "Facility",
    "Booking",
    "Visitor",
    "Route",
    "Stop",
    "RouteStop",
    "Bus",
    "Alert",
    "TelemetryLog",
]
