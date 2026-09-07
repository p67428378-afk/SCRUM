import uuid
from datetime import datetime, timezone
from typing import List
from sqlalchemy.orm import Session
from server.models.alert import AlertConfig, NotificationLog
from server.models.weather import WeatherRecord


def evaluate_alerts_for_reading(
    db: Session, reading: WeatherRecord
) -> List[NotificationLog]:
    """
    Evaluates active alert configurations for a location against a newly ingested weather reading.
    Enforces 1-minute (60 seconds) throttling per rule.
    """
    configs = (
        db.query(AlertConfig)
        .filter(
            AlertConfig.location_id == reading.location_id,
            AlertConfig.is_active == True,
        )
        .all()
    )

    dispatched_logs = []
    now_utc = datetime.now(timezone.utc)

    for cfg in configs:
        value = None
        m_type = cfg.metric_type.upper()
        if "TEMP" in m_type:
            value = reading.temperature_celsius
        elif "WIND" in m_type:
            value = reading.wind_speed_mph
        elif "PRECIP" in m_type or "RAIN" in m_type:
            value = reading.precipitation_inches
        elif "UV" in m_type:
            value = reading.uv_index
        elif "HUMID" in m_type:
            value = reading.humidity_percent
        elif "PRESS" in m_type:
            value = reading.pressure_hpa

        if value is None:
            continue

        triggered = False
        op = cfg.operator.upper()
        if op in ("GREATER_THAN", ">", "GTE", ">=") and value > cfg.threshold_value:
            triggered = True
        elif op in ("LESS_THAN", "<", "LTE", "<=") and value < cfg.threshold_value:
            triggered = True
        elif op in ("EQUALS", "==", "=") and value == cfg.threshold_value:
            triggered = True

        if triggered:
            # Check throttling (60 seconds)
            if cfg.last_triggered_at is not None:
                last_trig = cfg.last_triggered_at
                if last_trig.tzinfo is None:
                    last_trig = last_trig.replace(tzinfo=timezone.utc)
                seconds_since = (now_utc - last_trig).total_seconds()
                if seconds_since < 60:
                    continue

            msg = f"Alert triggered for {m_type}: {value} {cfg.operator} threshold {cfg.threshold_value}"
            log_entry = NotificationLog(
                id=str(uuid.uuid4()),
                alert_config_id=cfg.id,
                location_id=reading.location_id,
                triggered_value=value,
                message=msg,
                dispatched_at=now_utc,
            )
            cfg.last_triggered_at = now_utc
            db.add(log_entry)
            dispatched_logs.append(log_entry)

    if dispatched_logs:
        db.commit()

    return dispatched_logs
