from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Item Schemas
class ItemBase(BaseModel):
    sku: str = Field(..., max_length=50)
    name: str = Field(..., max_length=255)
    category_id: str
    unit_price: float = Field(..., ge=0)
    reorder_threshold: int = Field(default=10, ge=0)
    reorder_quantity: int = Field(default=50, ge=1)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    category_id: Optional[str] = None
    unit_price: Optional[float] = Field(None, ge=0)
    reorder_threshold: Optional[int] = Field(None, ge=0)
    reorder_quantity: Optional[int] = Field(None, ge=1)


class ItemResponse(ItemBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ItemListResponse(BaseModel):
    total: int
    items: List[ItemResponse]


# Warehouse Schemas
class WarehouseBase(BaseModel):
    code: str = Field(..., max_length=20)
    name: str = Field(..., max_length=100)
    location: Optional[str] = None


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseResponse(WarehouseBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Inventory / Stock Level Schemas
class InventoryResponseItem(BaseModel):
    item_id: str
    sku: str
    warehouse_id: str
    warehouse_name: str
    quantity_on_hand: int
    reorder_threshold: int
    is_low_stock: bool
    updated_at: datetime


class InventoryListResponse(BaseModel):
    total: int
    items: List[InventoryResponseItem]


# Stock Adjustment Schemas
class StockAdjustmentCreate(BaseModel):
    item_id: str
    warehouse_id: str
    quantity_change: int
    reason_code: str = Field(..., max_length=50)
    notes: Optional[str] = None
    user_id: Optional[str] = None


class StockAdjustmentResponse(BaseModel):
    adjustment_id: str
    item_id: str
    warehouse_id: str
    previous_quantity: int
    new_quantity: int
    quantity_change: int
    reason_code: str
    notes: Optional[str] = None
    alert_triggered: bool
    timestamp: datetime


class StockAdjustmentListResponse(BaseModel):
    total: int
    adjustments: List[StockAdjustmentResponse]


# Stock Transfer Schemas
class StockTransferCreate(BaseModel):
    item_id: str
    from_warehouse_id: str
    to_warehouse_id: str
    quantity: int = Field(..., gt=0)
    notes: Optional[str] = None
    user_id: Optional[str] = None


class StockTransferResponse(BaseModel):
    transfer_id: str
    item_id: str
    from_warehouse_id: str
    to_warehouse_id: str
    quantity: int
    outbound_adjustment_id: str
    inbound_adjustment_id: str
    timestamp: datetime


# Stock Alert Schemas
class StockAlertResponse(BaseModel):
    id: str
    item_id: str
    sku: str
    warehouse_id: str
    current_quantity: int
    reorder_threshold: int
    status: str
    created_at: datetime


class StockAlertListResponse(BaseModel):
    alerts: List[StockAlertResponse]


class StockAlertUpdate(BaseModel):
    status: str = Field(..., pattern="^(ACTIVE|ACKNOWLEDGED|RESOLVED)$")
