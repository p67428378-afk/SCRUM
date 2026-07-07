from pydantic import BaseModel


# KPI Schemas
class KPISchema(BaseModel):
    sales_per_linear_ft: float
    private_brand_pct: float
    in_stock_rate: float
    shelf_capacity: float
    sales_trend_pct: float
    private_brand_status: str
    in_stock_status: str

    class Config:
        from_attributes = True


# SKU Schemas
class SKUSchema(BaseModel):
    sku: str
    name: str
    sales: float
    units: int
    profit: float
    status: str

    class Config:
        from_attributes = True


# Scenario Schemas
class ScenarioRequest(BaseModel):
    scenario: str


class ActionSummary(BaseModel):
    grow: int
    maintain: int
    swap: int
    reduce: int


class GuardrailSummary(BaseModel):
    pb_penetration: str
    shelf_capacity: str


class ScenarioResponse(BaseModel):
    scenario: str
    projected_sales: float
    projected_private_brand_pct: float
    actions: ActionSummary
    guardrails: GuardrailSummary

    class Config:
        from_attributes = True


# Review Schemas
class ReviewRequest(BaseModel):
    scenario: str


class ReviewResponse(BaseModel):
    success: bool
    approved_scenario: str
    audit_trail: str
    timestamp: str
