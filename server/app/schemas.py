from pydantic import BaseModel, Field
from decimal import Decimal


class AlertRegisterRequest(BaseModel):
    alertDeliveryChannel: str = Field(..., alias="alertDeliveryChannel")
    cardNumber: str = Field(..., alias="cardNumber")
    dailySpendThreshold: Decimal = Field(..., alias="dailySpendThreshold")
    mobileNumber: str = Field(..., alias="mobileNumber")

    class Config:
        populate_by_name = True


class AlertRegisterResponse(BaseModel):
    otpReferenceId: str
    status: str


class OTPSendRequest(BaseModel):
    mobileNumber: str
    transactionType: str


class OTPSendResponse(BaseModel):
    otpReferenceId: str
    status: str


class OTPVerifyRequest(BaseModel):
    alertDeliveryChannel: str
    cardNumber: str
    dailySpendThreshold: Decimal
    mobileNumber: str
    otpCode: str
    otpReferenceId: str


class OTPVerifyResponse(BaseModel):
    alertDeliveryChannel: str
    cardIdentifier: str
    dailySpendThreshold: Decimal
    status: str


class AlertRuleResponse(BaseModel):
    alert_delivery_channel: str
    card_identifier: str
    current_daily_spend: Decimal
    daily_spend_threshold: Decimal
    status: str

    class Config:
        from_attributes = True
