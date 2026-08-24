from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.models import Reward, User
from server.schemas.schemas import RewardsBalanceResponse
from server.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/v1/rewards", tags=["Rewards"])


@router.get("/balance", response_model=RewardsBalanceResponse)
def get_rewards_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reward = db.query(Reward).filter(Reward.user_id == current_user.id).first()
    if not reward:
        return RewardsBalanceResponse(
            user_id=current_user.id,
            points_balance=0,
            updated_at=None,
        )
    return reward
