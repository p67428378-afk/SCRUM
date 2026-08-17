from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import PortfolioSchema
from server.services.portfolio_service import get_artist_portfolio

router = APIRouter(prefix="/api/v1", tags=["portfolio"])


@router.get("/portfolio", response_model=PortfolioSchema)
def get_portfolio(db: Session = Depends(get_db)):
    return get_artist_portfolio(db)
