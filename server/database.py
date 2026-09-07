import os
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/weather.db")

# Use StaticPool and check_same_thread=False for SQLite in-memory or file testing if needed
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from server.models import location, weather, forecast, alert  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models.location import Location
    from server.models.weather import WeatherRecord
    from server.models.forecast import WeatherForecast
    from server.models.alert import AlertConfig

    # Seed Location 1
    loc1 = db.query(Location).filter(Location.name == "San Francisco Station").first()
    if not loc1:
        loc1 = Location(
            id=str(uuid.uuid4()),
            name="San Francisco Station",
            city="San Francisco",
            state="CA",
            country="USA",
            latitude=37.7749,
            longitude=-122.4194,
            elevation_meters=16.0,
            status="ACTIVE",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(loc1)
        db.commit()
        db.refresh(loc1)

    # Seed Location 2
    loc2 = db.query(Location).filter(Location.name == "New York Station").first()
    if not loc2:
        loc2 = Location(
            id=str(uuid.uuid4()),
            name="New York Station",
            city="New York",
            state="NY",
            country="USA",
            latitude=40.7128,
            longitude=-74.0060,
            elevation_meters=10.0,
            status="ACTIVE",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(loc2)
        db.commit()
        db.refresh(loc2)

    # Seed Weather Record for Loc 1 if none exists
    rec = db.query(WeatherRecord).filter(WeatherRecord.location_id == loc1.id).first()
    if not rec:
        now_utc = datetime.now(timezone.utc)
        rec = WeatherRecord(
            id=str(uuid.uuid4()),
            location_id=loc1.id,
            temperature_celsius=22.5,
            humidity_percent=64.0,
            wind_speed_mph=14.2,
            wind_direction="NW",
            precipitation_inches=0.12,
            pressure_hpa=1013.2,
            uv_index=6.5,
            recorded_at=now_utc,
            created_at=now_utc,
        )
        db.add(rec)
        db.commit()

    # Seed 7-Day Forecasts for Loc 1
    existing_fc = (
        db.query(WeatherForecast).filter(WeatherForecast.location_id == loc1.id).first()
    )
    if not existing_fc:
        today = datetime.now(timezone.utc).date()
        for i in range(7):
            f_date = today + timedelta(days=i)
            fc = WeatherForecast(
                id=str(uuid.uuid4()),
                location_id=loc1.id,
                forecast_date=f_date,
                forecast_hour=12,
                temp_min_celsius=15.0 + i,
                temp_max_celsius=24.0 + i,
                precipitation_probability=20.0 + (i * 5),
                wind_speed_mph=10.0 + i,
                condition_text="Partly Cloudy" if i % 2 == 0 else "Sunny",
                created_at=datetime.now(timezone.utc),
            )
            db.add(fc)
        db.commit()

    # Seed Alert Config for Loc 1
    existing_alert = (
        db.query(AlertConfig).filter(AlertConfig.location_id == loc1.id).first()
    )
    if not existing_alert:
        ac = AlertConfig(
            id=str(uuid.uuid4()),
            location_id=loc1.id,
            metric_type="WIND_SPEED",
            operator="GREATER_THAN",
            threshold_value=50.0,
            user_email="analyst@weatherpulse.org",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(ac)
        db.commit()
