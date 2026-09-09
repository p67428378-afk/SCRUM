from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UtilityMetricBase(BaseModel):
    metric_type: str
    value: float
    unit: str


class UtilityMetricCreate(UtilityMetricBase):
    zone_id: Optional[str] = None


class UtilityMetricResponse(UtilityMetricBase):
    id: str
    zone_id: str
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)
