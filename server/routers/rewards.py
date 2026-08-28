from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from server.database import get_db
from server.dependencies.auth import get_current_user
from server.models.models import User, Reward
from server.schemas.schemas import RewardBalanceResponse

router = APIRouter(prefix="/api/v1/rewards", tags=["rewards"])


def add_loyalty_points(user_id: str, points: int, reason: str, db: Session) -> int:
    new_reward = Reward(user_id=user_id, points=points, reason=reason)
    db.add(new_reward)
    db.flush()

    total_points = (
        db.query(func.coalesce(func.sum(Reward.points), 0))
        .filter(Reward.user_id == user_id)
        .scalar()
    )
    return int(total_points or 0)


@router.get("/balance", response_model=RewardBalanceResponse)
def get_reward_balance(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    total_points = (
        db.query(func.coalesce(func.sum(Reward.points), 0))
        .filter(Reward.user_id == current_user.id)
        .scalar()
    )
    return RewardBalanceResponse(
        user_id=str(current_user.id), points_balance=int(total_points or 0)
    )
