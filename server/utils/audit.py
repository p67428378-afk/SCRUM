import datetime
import json
import logging

logger = logging.getLogger("audit")

# For testing purposes, we can store audit logs in memory
audit_logs = []


def clear_audit_logs():
    audit_logs.clear()


def log_event(
    event_type: str,
    user_id: str | None = None,
    username: str | None = None,
    source_ip: str | None = None,
    user_agent: str | None = None,
    channel: str | None = None,
    reason: str | None = None,
    severity: str = "INFO",
    details: dict | None = None,
):
    payload = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "username": username,
        "source_ip": source_ip,
        "user_agent": user_agent,
        "channel": channel,
        "reason": reason,
        "severity": severity,
        "details": details or {},
    }

    logger.info(json.dumps(payload))
    audit_logs.append(payload)
