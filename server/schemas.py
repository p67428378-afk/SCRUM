"""
Module: schemas
Purpose: Pydantic schemas for request/response validation and serialization.
Author: Backend_Worker
Created: 2026-06-30
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class KPIResponse(BaseModel):
    """
    Response schema for key performance indicators.
    """
    in_stock_rate: float = Field(..., description="In-stock rate percentage")
    private_brand_percentage: float = Field(..., description="Private brand percentage")
    sales_per_linear_ft: float = Field(..., description="Sales per linear foot in dollars")
    shelf_capacity_used: float = Field(..., description="Shelf capacity used percentage")

    class Config:
        from_attributes = True


class SKUResponse(BaseModel):
    """
    Response schema for a single SKU with performance metrics and recommendation.
    """
    sku: str = Field(..., description="Unique SKU identifier")
    product_name: str = Field(..., description="Name of the product")
    sales_revenue: float = Field(..., description="Sales revenue in dollars")
    units_sold: int = Field(..., description="Number of units sold")
    profit_margin: float = Field(..., description="Profit margin percentage")
    in_stock_rate: float = Field(..., description="In-stock rate percentage")
    recommendation_status: str = Field(..., description="System-generated recommendation status (GROW, MAINTAIN, SWAP, REDUCE)")

    class Config:
        from_attributes = True


class SKUActionItem(BaseModel):
    """
    Represents a SKU to add or remove in a scenario.
    """
    sku: str
    product_name: str


class SKUSwapItem(BaseModel):
    """
    Represents a SKU swap action in a scenario.
    """
    add_sku: str
    add_name: str
    remove_sku: str
    remove_name: str


class SKUActions(BaseModel):
    """
    Actions to be taken in a scenario.
    """
    add: List[SKUActionItem] = []
    remove: List[SKUActionItem] = []
    swap: List[SKUSwapItem] = []


class Guardrails(BaseModel):
    """
    Guardrail checks for a scenario.
    """
    private_brand_percentage_check: str = Field("PASS", description="Status of private brand percentage check")
    total_skus_check: str = Field("PASS", description="Status of total SKUs check")


class ScenarioResponse(BaseModel):
    """
    Response schema for a scenario.
    """
    scenario_name: str
    projected_sales_impact: float
    projected_private_brand_impact: float
    guardrails: Guardrails
    sku_actions: SKUActions


class SwapPayload(BaseModel):
    """
    Swap payload for approval submission.
    """
    add_sku: str
    remove_sku: str


class DecisionPayloadSKUActions(BaseModel):
    """
    SKU actions in the decision payload.
    """
    add: List[str] = []
    remove: List[str] = []
    swap: List[SwapPayload] = []


class DecisionPayload(BaseModel):
    """
    Decision payload for approval submission.
    """
    projected_sales_impact: float
    projected_private_brand_impact: float
    sku_actions: DecisionPayloadSKUActions


class ApprovalRequest(BaseModel):
    """
    Request schema for submitting an assortment scenario for approval.
    """
    scenario_name: str
    decision_payload: DecisionPayload


class ApprovalResponse(BaseModel):
    """
    Response schema for approval submission.
    """
    status: str
    message: str
    audit_id: str
    timestamp: str
    submitted_by: str
