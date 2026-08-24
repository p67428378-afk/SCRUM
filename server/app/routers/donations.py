import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models import User, Donation
from server.app.schemas import DonationCreate, DonationOut
from server.app.utils.security import get_current_user, security_scheme
from server.app.utils.pdf_generator import generate_donation_pdf_bytes

router = APIRouter(prefix="/api/v1/donations", tags=["Donations & E-Receipts"])


@router.post("", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
def create_donation(
    donation_in: DonationCreate,
    db: Session = Depends(get_db),
    # Optional auth for guest or logged-in devotee
    credentials=Depends(security_scheme),
):
    user_id = None
    if credentials:
        try:
            current_user = get_current_user(credentials, db)
            user_id = current_user.id
        except Exception:
            pass

    receipt_num = f"80G-SHIV-{uuid.uuid4().hex[:8].upper()}"

    donation = Donation(
        receipt_number=receipt_num,
        user_id=user_id,
        donor_name=donation_in.donor_name,
        donor_email=donation_in.donor_email,
        donor_phone=donation_in.donor_phone,
        donor_pan=donation_in.donor_pan,
        amount=donation_in.amount,
        payment_method=donation_in.payment_method or "UPI",
        tax_exemption_80g=donation_in.tax_exemption_80g
        if donation_in.tax_exemption_80g is not None
        else True,
        purpose=donation_in.purpose or "Temple Renovation & Seva",
    )

    db.add(donation)
    db.commit()
    db.refresh(donation)
    return donation


@router.get("/my-donations", response_model=List[DonationOut])
def get_my_donations(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    donations = (
        db.query(Donation)
        .filter(Donation.user_id == current_user.id)
        .order_by(Donation.created_at.desc())
        .all()
    )
    return donations


@router.get("/{donation_id}/receipt")
def download_donation_receipt(donation_id: str, db: Session = Depends(get_db)):
    donation = (
        db.query(Donation)
        .filter((Donation.id == donation_id) | (Donation.receipt_number == donation_id))
        .first()
    )

    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Donation record not found"
        )

    pdf_bytes = generate_donation_pdf_bytes(
        receipt_number=donation.receipt_number,
        donor_name=donation.donor_name,
        donor_pan=donation.donor_pan or "N/A",
        amount=float(donation.amount),
        payment_method=donation.payment_method,
        purpose=donation.purpose,
        created_at=donation.created_at,
        tax_exemption_80g=donation.tax_exemption_80g,
    )

    filename = f"Shri_Shivji_Mandir_Receipt_{donation.receipt_number}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("", response_model=List[DonationOut])
def list_donations(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Devotee can view their own, Admin/Staff can view all
    if current_user.role in ["Admin", "Staff"]:
        donations = (
            db.query(Donation)
            .order_by(Donation.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    else:
        donations = (
            db.query(Donation)
            .filter(Donation.user_id == current_user.id)
            .order_by(Donation.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    return donations
