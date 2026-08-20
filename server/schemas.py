from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class RegionBase(BaseModel):
    name: str = Field(..., description="Official name of the State or Union Territory")
    capital: str = Field(..., description="Capital city name")
    type: str = Field(
        ..., description="Administrative type: 'state' or 'union_territory'"
    )
    region: str = Field(..., description="Geographical zone (e.g. Western India)")
    population: int = Field(..., description="Estimated population")
    official_languages: List[str] = Field(..., description="List of official languages")
    iso_code: Optional[str] = Field(None, description="ISO 3166-2 code")
    area_sq_km: Optional[float] = Field(None, description="Total land area in sq km")
    density_per_sq_km: Optional[float] = Field(
        None, description="Population density per sq km"
    )


class RegionCreate(RegionBase):
    pass


class RegionResponse(RegionBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    detail: str
