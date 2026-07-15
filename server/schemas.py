# Pydantic Schemas
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime


class KPIResponse(BaseModel):
    sales_per_linear_ft: float
    private_brand_pct: float
    in_stock_rate: float
    shelf_capacity: float


class SKUPerformanceItem(BaseModel):
    id: str
    sku: str
    name: str
    brand: str
    is_private_brand: bool
    sales: float
    margin_pct: float
    status: str

    class Config:
        from_attributes = True


class SKUPerformanceResponse(BaseModel):
    items: List[SKUPerformanceItem]
    total: int
    page: int
    limit: int


class SKUActionItem(BaseModel):
    sku: str
    action: str


class ScenarioResponse(BaseModel):
    scenario_name: str
    projected_sales_growth: float
    projected_private_brand_pct: float
    projected_shelf_capacity_pct: float
    sku_actions: List[SKUActionItem]

    class Config:
        from_attributes = True


class AssortmentPlanCreate(BaseModel):
    scenario_name: str
    plan_details: Dict[str, Any]


class AssortmentPlanResponse(BaseModel):
    id: str
    scenario_name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
