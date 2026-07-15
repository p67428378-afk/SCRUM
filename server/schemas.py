from pydantic import BaseModel
from typing import List
from datetime import datetime


# KPI Response
class KPISummary(BaseModel):
    sales_per_linear_ft: float
    private_brand_pct: float
    in_stock_rate: float
    shelf_capacity: float

    class Config:
        from_attributes = True


# SKU Performance Item
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


# SKU Performance Paginated Response
class SKUPerformanceResponse(BaseModel):
    items: List[SKUPerformanceItem]
    total: int
    page: int
    limit: int


# Scenario SKU Action
class ScenarioSKUAction(BaseModel):
    sku: str
    action: str

    class Config:
        from_attributes = True


# Scenario Response
class ScenarioResponse(BaseModel):
    scenario_name: str
    projected_sales_growth: float
    projected_private_brand_pct: float
    projected_shelf_capacity_pct: float
    sku_actions: List[ScenarioSKUAction]

    class Config:
        from_attributes = True


# Assortment Plan Create Request
class AssortmentPlanCreate(BaseModel):
    scenario_name: str
    plan_details: dict


# Assortment Plan Response
class AssortmentPlanResponse(BaseModel):
    id: str
    scenario_name: str
    plan_details: dict
    created_at: datetime

    class Config:
        from_attributes = True
