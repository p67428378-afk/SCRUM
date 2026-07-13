from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List


# KPI Response
class KPIResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    sales_per_linear_ft: float
    private_brand_share: float
    in_stock_rate: float
    shelf_capacity_utilization: float


# SKU Item
class SKUItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    sku_id: str
    product_name: str
    brand_type: str
    weekly_sales: float
    margin_percent: float
    shelf_space: str
    status: str


# SKU List Response
class SKUListResponse(BaseModel):
    items: List[SKUItem]
    limit: int
    page: int
    total: int


# Guardrails
class Guardrails(BaseModel):
    margin_threshold: str
    private_brand_goal: str
    shelf_capacity_check: str


# SKU Action Summary
class SKUActionSummary(BaseModel):
    grow: int
    maintain: int
    reduce: int
    swap: int


# Scenario Response
class ScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    scenario_name: str
    projected_sales_change: float
    projected_private_brand_share: float
    projected_shelf_space_change: float
    sku_action_summary: SKUActionSummary
    guardrails: Guardrails


# Approval Request
class ApprovalRequest(BaseModel):
    scenario_name: str


# Approval Response
class ApprovalResponse(BaseModel):
    success: bool
    message: str
    transaction_id: str
    submitted_at: datetime
    user: str


# Audit Trail Response
class AuditTrailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    transaction_id: str
    scenario_name: str
    submitted_at: datetime
    user_name: str
    sku_action_summary: SKUActionSummary
