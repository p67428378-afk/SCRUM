from pydantic import BaseModel, ConfigDict
from typing import List


class KPIResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sales_per_linear_ft: float
    private_brand_pct: float
    in_stock_rate: float
    shelf_capacity: float


class SKUResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sku_id: str
    product_name: str
    sales_ytd: float
    units_sold: int
    profit_margin: float
    status: str


class SKUAction(BaseModel):
    sku_id: str
    action: str


class Guardrail(BaseModel):
    name: str
    status: str


class ScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scenario_name: str
    projected_sales_impact: float
    projected_pb_pct: float
    sku_actions: List[SKUAction]
    guardrails: List[Guardrail]


class ReviewRequest(BaseModel):
    selected_scenario: str
    sku_actions: List[SKUAction]


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    message: str
    status: str
    submitted_at: str
    transaction_id: str
