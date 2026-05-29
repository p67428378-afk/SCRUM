
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PaymentRequest(BaseModel):
    rental_id: str
    amount: float
    payment_token: str

class PaymentResponse(BaseModel):
    transaction_id: str
    payment_status: str

@router.post("/", response_model=PaymentResponse)
def process_payment(payment: PaymentRequest):
    # Dummy payment processing
    return {"transaction_id": "dummy_transaction_id", "payment_status": "Success"}
