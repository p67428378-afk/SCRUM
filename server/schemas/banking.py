import datetime
from uuid import UUID

from pydantic import BaseModel


class AccountResponse(BaseModel):
    id: UUID
    account_number: str
    account_type: str
    balance: float
    available_balance: float
    currency: str
    status: str
    created_at: datetime.datetime | None = None

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: UUID
    date: datetime.datetime
    description: str
    category: str
    amount: float
    type: str
    status: str

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    limit: int
    skip: int


class InternalTransferRequest(BaseModel):
    amount: float
    destination_account_id: UUID
    memo: str | None = None
    source_account_id: UUID


class InternalTransferResponse(BaseModel):
    id: UUID
    status: str
    amount: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class ExternalTransferRequest(BaseModel):
    amount: float
    destination_payee_id: UUID
    memo: str | None = None
    source_account_id: UUID
    step_up_session_id: UUID | None = None


class ExternalTransferResponse(BaseModel):
    id: UUID
    status: str
    amount: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class PayeeResponse(BaseModel):
    id: UUID
    name: str
    account_number: str | None = None
    routing_number: str | None = None
    status: str

    class Config:
        from_attributes = True


class PayeeCreateRequest(BaseModel):
    account_number: str
    name: str
    routing_number: str
    step_up_session_id: UUID


class PayeeVerifyRequest(BaseModel):
    verification_code: str


class LimitsResponse(BaseModel):
    daily_limit: float
    daily_remaining: float
    per_transaction_limit: float


class AlertPreferencesResponse(BaseModel):
    push_enabled: bool
    sms_enabled: bool
    email_enabled: bool
    low_balance_threshold: float
    large_transaction_threshold: float

    class Config:
        from_attributes = True


class AlertPreferencesUpdateRequest(BaseModel):
    push_enabled: bool
    sms_enabled: bool
    email_enabled: bool
    low_balance_threshold: float
    large_transaction_threshold: float


class AuditLogResponse(BaseModel):
    id: UUID
    timestamp: datetime.datetime
    event_type: str
    actor: str
    resource: str
    ip_address: str
    status: str
    details: dict

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    items: list[AuditLogResponse]
    total: int


class RiskSignalResponse(BaseModel):
    id: UUID
    timestamp: datetime.datetime
    signal_type: str
    risk_score: float
    details: dict

    class Config:
        from_attributes = True
