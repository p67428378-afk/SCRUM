from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.database import get_db
from server.models import Continent, Country, PortfolioInvestment
from server.schemas import (
    CountryCreate,
    CountryResponse,
    CountryDetailResponse,
    PortfolioInvestmentCreate,
    PortfolioInvestmentResponse,
)

router = APIRouter(prefix="/api/v1/countries", tags=["Countries"])


@router.get("", response_model=List[CountryResponse])
def get_countries(
    search: Optional[str] = Query(None, description="Search by country name or code"),
    continent_id: Optional[str] = Query(None, description="Filter by continent ID"),
    continent: Optional[str] = Query(
        None, description="Filter by continent name, code, or ID"
    ),
    status: Optional[str] = Query(None, description="Filter by portfolio status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Country, Continent.name.label("continent_name")).join(
        Continent, Country.continent_id == Continent.id
    )

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Country.name.ilike(search_pattern),
                Country.code.ilike(search_pattern),
                Country.capital.ilike(search_pattern),
                Country.region.ilike(search_pattern),
                Continent.name.ilike(search_pattern),
            )
        )

    target_continent_id = continent_id or continent
    if target_continent_id:
        target_str = target_continent_id.strip()
        query = query.filter(
            or_(
                Country.continent_id == target_str,
                Continent.name.ilike(f"%{target_str}%"),
                Continent.code.ilike(f"%{target_str}%"),
                Continent.id == target_str,
            )
        )

    if status:
        query = query.filter(Country.portfolio_status.ilike(status.strip()))

    results = query.offset(skip).limit(limit).all()

    response_items = []
    for country, cont_name in results:
        response_items.append(
            CountryResponse(
                id=country.id,
                name=country.name,
                code=country.code,
                capital=country.capital,
                population=country.population,
                region=country.region,
                continent_id=country.continent_id,
                continent_name=cont_name or "Unknown",
                portfolio_status=country.portfolio_status,
                total_investment_usd=country.total_investment_usd,
                created_at=country.created_at,
                updated_at=country.updated_at,
            )
        )
    return response_items


@router.get("/{country_id}", response_model=CountryDetailResponse)
def get_country_detail(country_id: str, db: Session = Depends(get_db)):
    result = (
        db.query(Country, Continent.name.label("continent_name"))
        .join(Continent, Country.continent_id == Continent.id)
        .filter(
            or_(
                Country.id == country_id,
                Country.code.ilike(country_id),
                Country.code.ilike(f"%{country_id}%"),
                Country.name.ilike(country_id),
                Country.name.ilike(f"%{country_id}%"),
            )
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found",
        )

    country, cont_name = result
    investments = (
        db.query(PortfolioInvestment)
        .filter(PortfolioInvestment.country_id == country.id)
        .all()
    )

    inv_responses = [
        PortfolioInvestmentResponse(
            id=inv.id,
            country_id=inv.country_id,
            asset_name=inv.asset_name,
            sector=inv.sector,
            amount_usd=inv.amount_usd,
            status=inv.status,
            date_added=inv.date_added,
            created_at=inv.created_at,
            updated_at=inv.updated_at,
        )
        for inv in investments
    ]

    return CountryDetailResponse(
        id=country.id,
        name=country.name,
        code=country.code,
        capital=country.capital,
        population=country.population,
        region=country.region,
        continent_id=country.continent_id,
        continent_name=cont_name or "Unknown",
        portfolio_status=country.portfolio_status,
        total_investment_usd=country.total_investment_usd,
        investments=inv_responses,
        created_at=country.created_at,
        updated_at=country.updated_at,
    )


@router.post("", response_model=CountryResponse, status_code=status.HTTP_201_CREATED)
def create_country(data: CountryCreate, db: Session = Depends(get_db)):
    continent = db.query(Continent).filter(Continent.id == data.continent_id).first()
    if not continent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Continent ID does not exist",
        )

    country = Country(
        continent_id=data.continent_id,
        name=data.name,
        code=data.code,
        capital=data.capital,
        population=data.population,
        region=data.region,
        portfolio_status=data.portfolio_status,
        total_investment_usd=data.total_investment_usd,
    )
    db.add(country)
    db.commit()
    db.refresh(country)

    return CountryResponse(
        id=country.id,
        name=country.name,
        code=country.code,
        capital=country.capital,
        population=country.population,
        region=country.region,
        continent_id=country.continent_id,
        continent_name=continent.name,
        portfolio_status=country.portfolio_status,
        total_investment_usd=country.total_investment_usd,
        created_at=country.created_at,
        updated_at=country.updated_at,
    )


@router.post(
    "/{country_id}/investments",
    response_model=PortfolioInvestmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_investment(
    country_id: str,
    data: PortfolioInvestmentCreate,
    db: Session = Depends(get_db),
):
    country = (
        db.query(Country)
        .filter(
            or_(
                Country.id == country_id,
                Country.code.ilike(country_id),
                Country.code.ilike(f"%{country_id}%"),
                Country.name.ilike(country_id),
                Country.name.ilike(f"%{country_id}%"),
            )
        )
        .first()
    )
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found",
        )

    inv = PortfolioInvestment(
        country_id=country.id,
        asset_name=data.asset_name,
        sector=data.sector,
        amount_usd=data.amount_usd,
        status=data.status,
        date_added=data.date_added,
    )
    db.add(inv)

    country.total_investment_usd += data.amount_usd
    db.commit()
    db.refresh(inv)

    return PortfolioInvestmentResponse(
        id=inv.id,
        country_id=inv.country_id,
        asset_name=inv.asset_name,
        sector=inv.sector,
        amount_usd=inv.amount_usd,
        status=inv.status,
        date_added=inv.date_added,
        created_at=inv.created_at,
        updated_at=inv.updated_at,
    )
