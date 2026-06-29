from pydantic import BaseModel, ConfigDict
from typing import List
from datetime import datetime


class KpiItem(BaseModel):
    label: str
    value: float
    trend: str


class KpiResponse(BaseModel):
    sales_per_linear_ft: KpiItem
    private_brand_pct: KpiItem
    in_stock_rate: KpiItem
    shelf_capacity: KpiItem


class SkuResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    private_brand: bool
    sales_performance: float
    shelf_space: float
    status: str


class SkuActionItem(BaseModel):
    id: str
    name: str
    action: str


class SkuActionSummary(BaseModel):
    grow: int
    maintain: int
    reduce: int
    swap: int


class Guardrails(BaseModel):
    private_brand_goal_met: bool
    shelf_space_limit_ok: bool


class ScenarioResponse(BaseModel):
    name: str
    projected_sales_impact: float
    projected_private_brand_impact: float
    sku_action_summary: SkuActionSummary
    guardrails: Guardrails
    skus_to_action: List[SkuActionItem]


class ActionSubmission(BaseModel):
    sku_id: str
    action: str


class SubmissionData(BaseModel):
    actions: List[ActionSubmission]


class AssortmentReviewCreate(BaseModel):
    scenario_name: str
    submission_data: SubmissionData


class AssortmentReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scenario_name: str
    user_id: str
    submission_data: SubmissionData
    audit_id: str
    status: str
    created_at: datetime
