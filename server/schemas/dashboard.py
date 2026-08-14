from pydantic import BaseModel


class DashboardStats(BaseModel):
    total: int
    completed: int
    in_progress: int
    overdue: int
    completion_rate: float
