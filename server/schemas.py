from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class KPIResponse(BaseModel):
    sales_per_linear_ft: float
    private_brand_percentage: float
    in_stock_rate: float
    shelf_capacity: float

    class Config:
        from_attributes = True


class SKUResponse(BaseModel):
    id: str
    product_name: str
    sku_id: str
    weekly_sales: Optional[float] = None
    profit_margin: Optional[float] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class SKUAction(BaseModel):
    sku_id: str
    action: str


class GuardrailCheck(BaseModel):
    name: str
    status: str  # "PASSED", "FAILED", "WARNING"


class ScenarioResponse(BaseModel):
    name: str
    projected_sales_lift: float
    private_brand_impact: float
    actions: List[SKUAction]
    guardrails: Optional[List[GuardrailCheck]] = None

    class Config:
        from_attributes = True


class SubmissionRequest(BaseModel):
    scenario_name: str
    submitted_by: EmailStr
    actions: List[SKUAction]


class SubmissionResponse(BaseModel):
    submission_id: str
    status: str
    timestamp: datetime
    guardrails_passed: Optional[bool] = True

    class Config:
        from_attributes = True
