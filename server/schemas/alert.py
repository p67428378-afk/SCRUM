from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AlertConfigCreate(BaseModel):
    location_id: str
    metric_type: str
    operator: str
    threshold_value: float
    user_email: str
    is_active: bool = True


class AlertConfigResponse(BaseModel):
    id: str
    location_id: str
    metric_type: str
    operator: str
    threshold_value: float
    user_email: str
    is_active: bool
    last_triggered_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AlertNotificationResponse(BaseModel):
    id: str
    alert_config_id: str
    location_id: str
    triggered_value: float
    message: str
    dispatched_at: datetime

    class Config:
        from_attributes = True
