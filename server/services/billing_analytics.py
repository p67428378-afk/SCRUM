from datetime import datetime
from typing import Any
from sqlalchemy.orm import Session
from server.models.models import UserLoginStats


def record_user_login_event(user_id: str, db: Session) -> None:
    try:
        stats: Any = (
            db.query(UserLoginStats).filter(UserLoginStats.user_id == user_id).first()
        )
        if not stats:
            stats = UserLoginStats(
                user_id=user_id, login_count=1, last_login=datetime.utcnow()
            )
            db.add(stats)
        else:
            current_count = int(stats.login_count or 0)
            stats.login_count = current_count + 1
            stats.last_login = datetime.utcnow()
        db.commit()
    except Exception:
        db.rollback()
        raise
