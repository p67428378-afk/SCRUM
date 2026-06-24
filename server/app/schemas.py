"""
Module: server.app.schemas
Purpose: Pydantic schemas for request/response validation and serialization.
Author: Backend Developer Agent
Created: 2026-06-24
"""

from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

# --- Common / Nested Schemas ---


class KPIMetrics(BaseModel):
    in_stock_rate: float = Field(..., description="In-stock rate percentage")
    private_brand_pct: float = Field(..., description="Private brand percentage")
    sales_per_linear_ft: float = Field(..., description="Sales per linear foot")
    shelf_capacity: float = Field(..., description="Shelf capacity percentage")


class Guardrails(BaseModel):
    in_stock_rate_above_minimum: bool
    private_brand_target_met: bool
    shelf_capacity_within_limits: bool


class SkuAction(BaseModel):
    sku: str = Field(..., description="SKU identifier")
    action: str = Field(
        ..., description="Action to take (e.g., GROW, MAINTAIN, SWAP, REDUCE)"
    )


class ScenarioImpact(BaseModel):
    in_stock_rate: float
    private_brand_pct: float
    sales_per_linear_ft: float
    shelf_capacity: float


class ScenarioResponse(BaseModel):
    name: str
    description: str
    guardrails: Guardrails
    projected_impact: ScenarioImpact
    sku_actions: List[SkuAction]


class SKUPerformance(BaseModel):
    id: str
    sku: str
    name: str
    brand: str
    private_brand: bool
    sales: float
    linear_ft: float
    sales_per_linear_ft: float
    in_stock_rate: float
    shelf_capacity_pct: float
    recommended_action: str


# --- Endpoint Request/Response Schemas ---


class DashboardResponse(BaseModel):
    kpi_metrics: KPIMetrics
    scenarios: List[ScenarioResponse]
    sku_performance: List[SKUPerformance]


class SubmitRequest(BaseModel):
    scenario_name: str = Field(..., description="Name of the selected scenario")
    sku_actions: List[SkuAction] = Field(..., description="List of SKU actions")


class SubmitResponse(BaseModel):
    audit_trail_id: str
    status: str
    submitted_at: datetime
    submitted_by: str
