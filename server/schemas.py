from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "category_manager"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class KPIHeaderResponse(BaseModel):
    sales_per_linear_ft: float = Field(..., description="Sales per linear foot in USD")
    private_brand_pct: float = Field(..., description="Private brand sales percentage")
    in_stock_rate: float = Field(..., description="In-stock service level percentage")
    shelf_capacity_pct: float = Field(
        ..., description="Shelf space capacity utilization percentage"
    )
    cluster_name: str = Field(
        default="Small Town Value Cluster", description="Store cluster name"
    )

    model_config = ConfigDict(from_attributes=True)


class SKUBase(BaseModel):
    sku_code: str
    product_name: str
    sub_category: str
    brand_type: str
    sales_per_linear_ft: float
    margin_pct: float
    units_sold: int
    action_badge: str  # GROW, MAINTAIN, SWAP, REDUCE
    shelf_space_inches: float = 12.0
    current_stock: int = 50
    in_stock_rate: float = 96.5


class SKUCreate(SKUBase):
    pass


class SKUUpdate(BaseModel):
    sku_code: Optional[str] = None
    product_name: Optional[str] = None
    sub_category: Optional[str] = None
    brand_type: Optional[str] = None
    sales_per_linear_ft: Optional[float] = None
    margin_pct: Optional[float] = None
    units_sold: Optional[int] = None
    action_badge: Optional[str] = None
    shelf_space_inches: Optional[float] = None
    current_stock: Optional[int] = None
    in_stock_rate: Optional[float] = None


class SKUResponse(SKUBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SKUListResponse(BaseModel):
    items: List[SKUResponse]
    total: int
    grow_count: int
    maintain_count: int
    swap_count: int
    reduce_count: int


class ScenarioResponse(BaseModel):
    id: str
    scenario_key: str
    display_name: str
    description: Optional[str] = None
    projected_sales_lift_pct: float
    projected_private_brand_pct: float
    projected_shelf_capacity_pct: float
    risk_level: str
    grow_count: int
    maintain_count: int
    swap_count: int
    reduce_count: int
    is_default: bool

    model_config = ConfigDict(from_attributes=True)


class ScenarioEvaluateRequest(BaseModel):
    scenario: Optional[str] = "Balanced"
    custom_parameters: Optional[Dict[str, Any]] = None


class SKUActionSummary(BaseModel):
    GROW: int = 0
    MAINTAIN: int = 0
    SWAP: int = 0
    REDUCE: int = 0


class ScenarioEvaluateResponse(BaseModel):
    scenario: str
    display_name: str
    projected_sales_lift_pct: float
    projected_private_brand_pct: float
    projected_shelf_capacity_pct: float
    risk_level: str
    sku_action_summary: Dict[str, int]


class GuardrailCheckItem(BaseModel):
    name: str
    description: str
    threshold: str
    actual_value: str
    status: str  # PASSED / FAILED / WARNING
    passed: bool


class GuardrailCheckRequest(BaseModel):
    scenario: Optional[str] = "Balanced"
    cluster_name: Optional[str] = "Small Town Value Cluster"


class GuardrailCheckResponse(BaseModel):
    pass_all: bool
    shelf_capacity_check: str
    private_brand_check: str
    in_stock_check: str
    margin_check: str
    checks: List[GuardrailCheckItem]


class ApprovalSubmitRequest(BaseModel):
    scenario: Optional[str] = "Balanced"
    cluster_name: Optional[str] = "Small Town Value Cluster"
    user_id: Optional[str] = "user@dollargeneral.com"
    notes: Optional[str] = None


class ApprovalSubmitResponse(BaseModel):
    audit_id: str
    timestamp: str
    user_id: str
    cluster_name: str
    scenario: str
    total_modified_skus: int
    guardrail_status: str
    status: str
    message: str


class SubmissionAuditResponse(BaseModel):
    id: str
    audit_id: str
    user_id: str
    cluster_name: str
    scenario: str
    total_modified_skus: int
    guardrail_status: str
    status: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
