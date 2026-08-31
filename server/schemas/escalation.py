from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from server.schemas.user import UserResponse


class EscalationLogResponse(BaseModel):
    id: str
    task_id: str
    project_id: str
    priority: str
    reason: str
    notified_admin_id: Optional[str] = None
    created_at: datetime
    notified_admin: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
