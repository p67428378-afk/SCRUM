"""
Module: schemas
Purpose: Pydantic schemas for request and response validation.
"""
from datetime import datetime
from typing import List, Dict
from pydantic import BaseModel, Field

class SkuActionSchema(BaseModel):
    sku: str = Field(..., description="The SKU identifier")
    action: str = Field(..., description="The action to take (GROW, MAINTAIN, SWAP, REDUCE)")

class AssortmentSubmitRequest(BaseModel):
    scenario_name: str = Field(..., description="The name of the selected scenario")
    submitted_by: str = Field(..., description="The user submitting the assortment changes")
    sku_actions: List[SkuActionSchema] = Field(..., description="The list of SKU actions")

class AssortmentSubmitResponse(BaseModel):
    id: str
    scenario_name: str
    submitted_by: str
    submission_timestamp: datetime
    sku_actions: List[SkuActionSchema]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class KPISchema(BaseModel):
    sales_per_linear_ft: float
    private_brand_pct: float
    in_stock_rate: float
    shelf_capacity: float

class SkuPerformanceSchema(BaseModel):
    sku: str
    name: str
    sales: float
    units: int
    margin: float
    days_of_supply: int
    private_brand: bool
    status: str

class ScenarioGuardrailsSchema(BaseModel):
    private_brand_check: str
    shelf_capacity_check: str

class ScenarioDetailSchema(BaseModel):
    name: str
    projected_sales_impact: float
    projected_private_brand_pct: float
    projected_shelf_capacity: float
    guardrails: ScenarioGuardrailsSchema
    sku_actions: List[SkuActionSchema]

class DashboardResponse(BaseModel):
    kpis: KPISchema
    skus: List[SkuPerformanceSchema]
    scenarios: Dict[str, ScenarioDetailSchema]
