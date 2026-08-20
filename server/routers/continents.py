from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.database import get_db
from server.models import Continent, Country
from server.schemas import ContinentCreate, ContinentResponse

router = APIRouter(prefix="/api/v1/continents", tags=["Continents"])


@router.get("", response_model=List[ContinentResponse])
def get_continents(db: Session = Depends(get_db)):
    continents = db.query(Continent).all()
    result = []
    for c in continents:
        countries = db.query(Country).filter(Country.continent_id == c.id).all()
        country_count = len(countries)
        total_assets = sum(cnt.total_investment_usd for cnt in countries)
        result.append(
            ContinentResponse(
                id=c.id,
                name=c.name,
                code=c.code,
                country_count=country_count,
                total_portfolio_assets_usd=total_assets,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
        )
    return result


@router.get("/{continent_id}", response_model=ContinentResponse)
def get_continent_by_id(continent_id: str, db: Session = Depends(get_db)):
    c = (
        db.query(Continent)
        .filter(
            or_(
                Continent.id == continent_id,
                Continent.code.ilike(continent_id),
                Continent.name.ilike(continent_id),
                Continent.name.ilike(f"%{continent_id}%"),
            )
        )
        .first()
    )
    if not c:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Continent not found"
        )

    countries = db.query(Country).filter(Country.continent_id == c.id).all()
    country_count = len(countries)
    total_assets = sum(cnt.total_investment_usd for cnt in countries)

    return ContinentResponse(
        id=c.id,
        name=c.name,
        code=c.code,
        country_count=country_count,
        total_portfolio_assets_usd=total_assets,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )


@router.post("", response_model=ContinentResponse, status_code=status.HTTP_201_CREATED)
def create_continent(data: ContinentCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(Continent)
        .filter((Continent.name == data.name) | (Continent.code == data.code))
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Continent with this name or code already exists",
        )
    c = Continent(name=data.name, code=data.code)
    db.add(c)
    db.commit()
    db.refresh(c)
    return ContinentResponse(
        id=c.id,
        name=c.name,
        code=c.code,
        country_count=0,
        total_portfolio_assets_usd=0.0,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )
