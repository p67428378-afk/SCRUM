from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime


class InventoryItemBase(BaseModel):
    name: str
    category: str
    material: str
    gemstone_type: Optional[str] = Field(default=None)
    carat_weight: Optional[float] = Field(default=None)
    price: float
    stock_quantity: int = Field(default=0)
    low_stock_threshold: int = Field(default=5)


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(InventoryItemBase):
    pass


class InventoryItemResponse(BaseModel):
    id: str
    name: str
    category: str
    material: str
    gemstone_type: Optional[str] = None
    carat_weight: Optional[float] = None
    price: float
    stock_quantity: int
    low_stock_threshold: int
    status: str

    model_config = ConfigDict(from_attributes=True)


class PaginatedInventoryResponse(BaseModel):
    items: List[InventoryItemResponse]
    limit: int
    page: int
    total: int


class CategoryDistributionItem(BaseModel):
    category: str
    count: int
    value: float


class DashboardStatsResponse(BaseModel):
    category_distribution: List[CategoryDistributionItem]
    low_stock_count: int
    out_of_stock_count: int
    total_items: int
    total_value: float


class AuditLogResponseItem(BaseModel):
    id: str
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    action: str
    details: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    logs: List[AuditLogResponseItem]


class AttributesResponse(BaseModel):
    categories: List[str]
    gemstones: List[str]
    materials: List[str]
