import uuid
from sqlalchemy.orm import Session

from server.models.models import UserLoginStats, UserActivityLog, utc_now


def calculate_pricing_tier(login_count: int) -> str:
    """
    Determines pricing tier based on login frequency:
      - 1 to 5 logins: Free
      - 6 to 20 logins: Standard
      - 21 to 100 logins: Pro
      - > 100 logins: Enterprise
    """
    if login_count <= 5:
        return "Free"
    elif login_count <= 20:
        return "Standard"
    elif login_count <= 100:
        return "Pro"
    else:
        return "Enterprise"


def record_user_login_event(user_id: str, db: Session) -> UserLoginStats:
    """
    Records a user login event:
    1. Increments user login count in user_login_stats table.
    2. Recalculates pricing tier based on updated login count.
    3. Creates a corresponding entry in user_activity_logs.
    """
    stats = db.query(UserLoginStats).filter(UserLoginStats.user_id == user_id).first()
    now = utc_now()

    if not stats:
        stats = UserLoginStats(
            id=str(uuid.uuid4()),
            user_id=user_id,
            login_count=1,
            pricing_tier=calculate_pricing_tier(1),
            last_login_at=now,
            updated_at=now,
        )
        db.add(stats)
    else:
        stats.login_count += 1
        stats.pricing_tier = calculate_pricing_tier(stats.login_count)
        stats.last_login_at = now
        stats.updated_at = now

    # Also log a USER_LOGIN activity record
    activity_log = UserActivityLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        activity_type="USER_LOGIN",
        endpoint="/api/v1/users/login",
        http_method="POST",
        status_code=200,
        client_ip="127.0.0.1",
        execution_ms=0.0,
        created_at=now,
    )
    db.add(activity_log)

    db.commit()
    db.refresh(stats)
    return stats
