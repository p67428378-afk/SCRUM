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
    id: UUID
    push_enabled: bool
    sms_enabled: bool
    email_enabled: bool
    low_balance_threshold: float
    large_transaction_threshold: float
    channels: dict

    class Config:
        from_attributes = True


class AlertPreferencesUpdateRequest(BaseModel):
    push_enabled: bool | None = None
    sms_enabled: bool | None = None
    email_enabled: bool | None = None
    low_balance_threshold: float
    large_transaction_threshold: float
    channels: dict | None = None


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


class MessageResponse(BaseModel):
    id: UUID
    sender: str
    subject: str
    body: str
    is_read: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class MessageCreateRequest(BaseModel):
    subject: str
    body: str
    recipient_username: str | None = None


class MessageUpdateRequest(BaseModel):
    is_read: bool


class AlertResponse(BaseModel):
    id: UUID
    type: str
    message: str
    channel: str
    is_delivered: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class WebhookSubscriptionResponse(BaseModel):
    id: UUID
    url: str
    event_type: str
    events: list[str]
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class WebhookSubscriptionCreateRequest(BaseModel):
    url: str
    event_type: str | None = None
    events: list[str] | None = None
    secret: str | None = None


class ConfigItemResponse(BaseModel):
    id: UUID
    key: str
    value: str
    description: str | None = None
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class ConfigItemCreateRequest(BaseModel):
    key: str
    value: str
    description: str | None = None


class ProfileResponse(BaseModel):
    username: str
    email: str
    phone_number: str | None = None

    class Config:
        from_attributes = True


class ContactChangeRequest(BaseModel):
    email: str
    phone_number: str


class ContactVerifyRequest(BaseModel):
    code: str
