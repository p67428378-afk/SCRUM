import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from server.models.forecast import WeatherForecast
from server.schemas.forecast import ForecastDay, ForecastHour, ForecastResponse


def get_or_generate_forecasts(db: Session, location_id: str) -> ForecastResponse:
    today = datetime.now(timezone.utc).date()
    end_date = today + timedelta(days=7)

    db_forecasts = (
        db.query(WeatherForecast)
        .filter(
            WeatherForecast.location_id == location_id,
            WeatherForecast.forecast_date >= today,
            WeatherForecast.forecast_date <= end_date,
        )
        .order_by(WeatherForecast.forecast_date, WeatherForecast.forecast_hour)
        .all()
    )

    if not db_forecasts:
        # Generate default 7-day forecasts
        new_forecasts = []
        conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Clear"]
        for i in range(7):
            f_date = today + timedelta(days=i)
            # Daily noon forecast
            fc = WeatherForecast(
                id=str(uuid.uuid4()),
                location_id=location_id,
                forecast_date=f_date,
                forecast_hour=12,
                temp_min_celsius=14.0 + (i % 3),
                temp_max_celsius=22.0 + (i % 4),
                precipitation_probability=10.0 * (i % 5),
                wind_speed_mph=8.0 + i,
                condition_text=conditions[i % len(conditions)],
                created_at=datetime.now(timezone.utc),
            )
            new_forecasts.append(fc)
            db.add(fc)

        db.commit()
        db_forecasts = new_forecasts

    # Group into daily and hourly items
    daily_map = {}
    hourly_list = []

    for f in db_forecasts:
        f_date = f.forecast_date
        if f_date not in daily_map:
            daily_map[f_date] = ForecastDay(
                forecast_date=f_date,
                temp_min_celsius=f.temp_min_celsius,
                temp_max_celsius=f.temp_max_celsius,
                precipitation_probability=f.precipitation_probability,
                wind_speed_mph=f.wind_speed_mph,
                condition_text=f.condition_text,
            )

        hourly_list.append(
            ForecastHour(
                forecast_date=f_date,
                forecast_hour=f.forecast_hour,
                temp_min_celsius=f.temp_min_celsius,
                temp_max_celsius=f.temp_max_celsius,
                precipitation_probability=f.precipitation_probability,
                wind_speed_mph=f.wind_speed_mph,
                condition_text=f.condition_text,
            )
        )

    daily_list = list(daily_map.values())

    return ForecastResponse(
        location_id=location_id, daily=daily_list, hourly=hourly_list
    )
