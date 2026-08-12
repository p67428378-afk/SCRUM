"""
Module: seed_data
Purpose: Idempotently seed sample routes, stops, buses, and test accounts
"""

from sqlalchemy.orm import Session
from server.app.models.bus_tracking import Route, Stop, RouteStop, Bus
from server.app.models.resident import Resident


def seed_data(db: Session):
    """
    Idempotent database seeder.
    """
    # 1. Seed Test Accounts (Resident model used for user accounts)
    test_user = db.query(Resident).filter(Resident.email == "test@example.com").first()
    if not test_user:
        test_user = Resident(
            name="Test User",
            email="test@example.com",
            apartment_number="101",
            phone_number="555-0101",
        )
        db.add(test_user)

    admin_user = (
        db.query(Resident).filter(Resident.email == "admin@example.com").first()
    )
    if not admin_user:
        admin_user = Resident(
            name="Admin User",
            email="admin@example.com",
            apartment_number="1001",
            phone_number="555-0999",
        )
        db.add(admin_user)

    # 2. Seed Sample Bus Stops
    stops_data = [
        {
            "name": "Central Station",
            "address": "100 Main Street",
            "lat": 40.7128,
            "lon": -74.0060,
        },
        {
            "name": "Main St & 5th Ave",
            "address": "500 Main Street",
            "lat": 40.7150,
            "lon": -74.0020,
        },
        {
            "name": "Oak Street Park",
            "address": "120 Oak Street",
            "lat": 40.7180,
            "lon": -73.9980,
        },
        {
            "name": "University Campus",
            "address": "800 College Way",
            "lat": 40.7220,
            "lon": -73.9920,
        },
    ]

    stops_map = {}
    for data in stops_data:
        stop = db.query(Stop).filter(Stop.name == data["name"]).first()
        if not stop:
            stop = Stop(
                name=data["name"],
                address=data["address"],
                latitude=data["lat"],
                longitude=data["lon"],
            )
            db.add(stop)
            db.flush()
        stops_map[data["name"]] = stop

    # 3. Seed Sample Route
    route = db.query(Route).filter(Route.code == "R101").first()
    if not route:
        route = Route(
            name="Route 101 - Downtown Express",
            code="R101",
            description="Main transit corridor from Central Station to University",
            is_active=True,
            path_geojson='{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-74.0060,40.7128],[-73.9920,40.7220]]}}',
        )
        db.add(route)
        db.flush()

        # Connect stops to route
        for idx, (stop_name, offset) in enumerate(
            [
                ("Central Station", 0),
                ("Main St & 5th Ave", 5),
                ("Oak Street Park", 12),
                ("University Campus", 20),
            ]
        ):
            if stop_name in stops_map:
                rs = RouteStop(
                    route_id=route.id,
                    stop_id=stops_map[stop_name].id,
                    stop_order=idx + 1,
                    estimated_time_offset_minutes=offset,
                )
                db.add(rs)

    # 4. Seed Sample Bus Fleet
    buses_data = [
        {
            "bus_number": "BUS-42",
            "plate": "XYZ-4242",
            "driver": "John Driver",
            "lat": 40.7135,
            "lon": -74.0045,
            "speed": 22.5,
        },
        {
            "bus_number": "BUS-15",
            "plate": "ABC-1515",
            "driver": "Sarah Speed",
            "lat": 40.7190,
            "lon": -73.9960,
            "speed": 18.0,
        },
    ]

    for bdata in buses_data:
        bus = db.query(Bus).filter(Bus.bus_number == bdata["bus_number"]).first()
        if not bus:
            bus = Bus(
                bus_number=bdata["bus_number"],
                license_plate=bdata["plate"],
                route_id=route.id if route else None,
                driver_name=bdata["driver"],
                status="Active",
                latitude=bdata["lat"],
                longitude=bdata["lon"],
                speed_mph=bdata["speed"],
            )
            db.add(bus)

    db.commit()
