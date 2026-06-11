from sqlalchemy.orm import Session

from server.models.rental import Rental

def process_payment(db: Session, rental_id: str, amount: float, payment_token: str):
    # In a real application, this would integrate with a payment gateway (e.g., Stripe, PayPal)
    # For this example, we'll simulate a successful payment.
    db_rental = db.query(Rental).filter(Rental.rental_id == rental_id).first()

    if db_rental:
        # Simulate payment success
        db_rental.payment_status = "paid"
        db_rental.total_price = amount # Update total price with the actual paid amount
        db.commit()
        db.refresh(db_rental)
        return {"payment_status": "paid", "transaction_id": f"txn_{rental_id}"}
    return None
