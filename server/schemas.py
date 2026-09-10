from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


# -----------------------------------------------------------------------------
# SKU Schemas
# -----------------------------------------------------------------------------
class SKUBase(BaseModel):
    sku_code: str
    product_name: str
    category: str = "Snacks"
    cluster_id: str = "Small Town Value Cluster"
    is_private_brand: bool = False
    weekly_units_sold: float = 0.0
    sales_per_linear_ft: float = 0.0
    margin_percentage: float = 0.0
    linear_ft_allocated: float = 1.0
    status_badge: str = "MAINTAIN"


class SKUCreate(SKUBase):
    pass


class SKUUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    cluster_id: Optional[str] = None
    is_private_brand: Optional[bool] = None
    weekly_units_sold: Optional[float] = None
    sales_per_linear_ft: Optional[float] = None
    margin_percentage: Optional[float] = None
    linear_ft_allocated: Optional[float] = None
    status_badge: Optional[str] = None


class SKUResponse(SKUBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# KPI Schemas
# -----------------------------------------------------------------------------
class KPIMetricsResponse(BaseModel):
    cluster_name: str = "Small Town Value Cluster"
    category: str = "Snacks"
    sales_per_linear_ft: float
    private_brand_percentage: float
    in_stock_rate: float
    shelf_capacity_utilization: float

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# Scenario Schemas
# -----------------------------------------------------------------------------
class RecommendedActions(BaseModel):
    GROW: int = 0
    MAINTAIN: int = 0
    SWAP: int = 0
    REDUCE: int = 0


class ScenarioEvaluateRequest(BaseModel):
    scenario_type: str
    cluster_name: Optional[str] = "Small Town Value Cluster"


class ScenarioEvaluateResponse(BaseModel):
    scenario_type: str
    projected_sales_lift_pct: float
    projected_pb_share_pct: float
    projected_capacity_pct: float
    recommended_actions: RecommendedActions


class ScenarioConfigResponse(BaseModel):
    id: str
    scenario_type: str
    description: Optional[str] = None
    projected_sales_lift_pct: float
    projected_pb_share_pct: float
    projected_capacity_pct: float
    is_default: bool
    recommended_actions: RecommendedActions

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# Guardrail Schemas
# -----------------------------------------------------------------------------
class GuardrailCheckRequest(BaseModel):
    scenario_type: Optional[str] = "Balanced"
    projected_pb_share_pct: Optional[float] = None
    projected_capacity_pct: Optional[float] = None
    in_stock_rate: Optional[float] = None


class GuardrailItem(BaseModel):
    rule: str
    status: str  # "PASSED", "WARNING", "FAILED"
    actual_value: str


class GuardrailCheckResponse(BaseModel):
    overall_status: str  # "PASSED", "WARNING", "FAILED"
    checks: List[GuardrailItem]


# -----------------------------------------------------------------------------
# Submission Schemas
# -----------------------------------------------------------------------------
class ActionsSummary(BaseModel):
    grow: int = 0
    maintain: int = 0
    swap: int = 0
    reduce: int = 0


class SubmissionCreateRequest(BaseModel):
    user_id: str = "category_mgr_01"
    scenario_type: str = "Balanced"
    cluster_name: Optional[str] = "Small Town Value Cluster"
    actions_summary: Optional[ActionsSummary] = None


class SubmissionResponse(BaseModel):
    audit_code: str
    message: str = "Assortment changes submitted successfully."
    user_id: str
    scenario_type: str
    total_sku_actions: int
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)
