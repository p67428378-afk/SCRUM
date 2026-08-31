from typing import Optional, List, Dict
from pydantic import BaseModel


class TaskAnalyticsResponse(BaseModel):
    project_id: Optional[str] = None
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    overdue_tasks: int
    status_distribution: Dict[str, int]


class UserProductivityItem(BaseModel):
    user_id: str
    user_name: str
    tasks_completed: int


class ProductivityAnalyticsResponse(BaseModel):
    project_id: Optional[str] = None
    avg_cycle_time_days: float
    productivity_by_user: List[UserProductivityItem]
