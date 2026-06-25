from pydantic import BaseModel
from typing import List


# KPI Schemas
class KPISchema(BaseModel):
    in_stock_rate: float
    private_brand_pct: float
    sales_per_linear_ft: float
    shelf_capacity: float

    class Config:
        from_attributes = True


# SKU Schemas
class SKUSchema(BaseModel):
    sku_id: str
    product_name: str
    sales_ytd: float
    units_sold: int
    profit_margin: float
    status: str

    class Config:
        from_attributes = True


# Scenario Schemas
class GuardrailSchema(BaseModel):
    name: str
    status: str


class SKUActionSchema(BaseModel):
    sku_id: str
    action: str


class ScenarioSchema(BaseModel):
    scenario_name: str
    projected_sales_impact: float
    projected_pb_pct: float
    sku_actions: List[SKUActionSchema]
    guardrails: List[GuardrailSchema]

    class Config:
        from_attributes = True


# Review Schemas
class ReviewCreateSchema(BaseModel):
    selected_scenario: str
    sku_actions: List[SKUActionSchema]


class ReviewResponseSchema(BaseModel):
    message: str
    status: str
    submitted_at: str
    transaction_id: str

    class Config:
        from_attributes = True
