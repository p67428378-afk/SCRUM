from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AccountResponse(BaseModel):
    id: str
    account_number: str
    owner_name: str
    email: str
    balance: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
