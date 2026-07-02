from pydantic import BaseModel
from typing import List, Optional


# KPI schemas
class KpiItem(BaseModel):
    value: float
    change: float


class Kpis(BaseModel):
    sales_per_linear_ft: KpiItem
    private_brand_pct: KpiItem
    in_stock_rate: KpiItem
    shelf_capacity: KpiItem


# SKU schemas
class SkuItem(BaseModel):
    id: str
    sku_id: str
    name: str
    brand: str
    is_private_brand: bool
    weekly_sales: float
    sales_trend_wow: float
    profit_margin: float
    days_of_supply: int
    recommendation_status: str

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    kpis: Kpis
    skus: List[SkuItem]


# Scenario schemas
class Guardrails(BaseModel):
    private_brand_valid: bool
    shelf_capacity_valid: bool


class SkuActionItem(BaseModel):
    sku_id: str
    name: str
    action: str
    replacement_sku_id: Optional[str] = None
    replacement_name: Optional[str] = None


class ScenarioResponse(BaseModel):
    scenario_name: str
    projected_sales_lift: float
    projected_private_brand_pct: float
    guardrails: Guardrails
    sku_actions: List[SkuActionItem]


# Submission schemas
class SubmitSkuAction(BaseModel):
    sku_id: str
    action: str
    replacement_sku_id: Optional[str] = None


class SubmitRequest(BaseModel):
    scenario_name: str
    projected_sales_lift: float
    projected_private_brand_pct: float
    sku_actions: List[SubmitSkuAction]


class SubmitResponse(BaseModel):
    status: str
    submission_id: str
    confirmation_number: str
    summary: str
    timestamp: str
