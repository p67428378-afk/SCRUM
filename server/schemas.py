from pydantic import BaseModel
from typing import List
from datetime import datetime


# KPI Schemas
class KPISchema(BaseModel):
    sales_per_linear_ft: float
    private_brand_pct: float
    in_stock_rate: float
    shelf_capacity: float

    class Config:
        from_attributes = True


# SKU Schemas
class SKUBase(BaseModel):
    sku_id: str
    name: str
    weekly_sales: float
    profit_margin: float
    private_brand: bool
    status: str


class SKUCreate(SKUBase):
    pass


class SKUResponse(SKUBase):
    class Config:
        from_attributes = True


class SKUListResponse(BaseModel):
    items: List[SKUResponse]
    page: int
    per_page: int
    total: int


# Scenario Schemas
class ActionsSummary(BaseModel):
    adds: int
    removals: int
    swaps: int


class GuardrailCheck(BaseModel):
    name: str
    status: str  # PASS / FAIL
    value: str


class ScenarioResponse(BaseModel):
    scenario_name: str
    projected_sales_change_pct: float
    projected_private_brand_pct: float
    projected_shelf_capacity: float
    actions_summary: ActionsSummary
    guardrails: List[GuardrailCheck]


# Assortment Submission Schemas
class AssortmentCreate(BaseModel):
    scenario_name: str


class AssortmentActionResponse(BaseModel):
    sku_id: str
    action_type: str

    class Config:
        from_attributes = True


class AssortmentResponse(BaseModel):
    transaction_id: str
    scenario_name: str
    status: str
    summary: str
    created_at: datetime
    actions: List[AssortmentActionResponse] = []

    class Config:
        from_attributes = True


class AssortmentSubmitResponse(BaseModel):
    status: str
    summary: str
    timestamp: str
    transaction_id: str
