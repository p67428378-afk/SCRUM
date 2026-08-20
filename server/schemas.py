from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class PortfolioInvestmentBase(BaseModel):
    asset_name: str
    sector: str
    amount_usd: float
    status: str = "Performing"
    date_added: Optional[str] = None


class PortfolioInvestmentCreate(PortfolioInvestmentBase):
    pass


class PortfolioInvestmentResponse(PortfolioInvestmentBase):
    id: str
    country_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CountryBase(BaseModel):
    name: str
    code: str
    capital: Optional[str] = None
    population: Optional[int] = None
    region: Optional[str] = None
    portfolio_status: str = "Active"
    total_investment_usd: float = 0.0


class CountryCreate(CountryBase):
    continent_id: str


class CountryResponse(CountryBase):
    id: str
    continent_id: str
    continent_name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CountryDetailResponse(CountryResponse):
    investments: List[PortfolioInvestmentResponse] = []


class ContinentBase(BaseModel):
    name: str
    code: str


class ContinentCreate(ContinentBase):
    pass


class ContinentResponse(ContinentBase):
    id: str
    country_count: int = 0
    total_portfolio_assets_usd: float = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
