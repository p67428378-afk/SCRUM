from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User, ActorProfile, FilmographyCredit
from server.schemas import CreditCreate, CreditOut
from server.routers.auth import get_current_user

router = APIRouter(prefix="/api/v1/actors/credits", tags=["Filmography Credits"])

VALID_CATEGORIES = {"Theater", "Film", "Television", "Commercials", "Voiceover"}


@router.get("", response_model=List[CreditOut])
def get_credits(
    category: Optional[str] = Query(None, description="Filter by credit category"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(ActorProfile).filter(ActorProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor profile not found",
        )

    query = db.query(FilmographyCredit).filter(FilmographyCredit.actor_id == profile.id)
    if category:
        query = query.filter(FilmographyCredit.category.ilike(category))

    return query.order_by(
        FilmographyCredit.year.desc(), FilmographyCredit.created_at.desc()
    ).all()


@router.post("", response_model=CreditOut, status_code=201)
def create_credit(
    credit_in: CreditCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(ActorProfile).filter(ActorProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor profile not found",
        )

    # Validate category
    matched_category = None
    for cat in VALID_CATEGORIES:
        if cat.lower() == credit_in.category.lower():
            matched_category = cat
            break
    if not matched_category:
        matched_category = credit_in.category

    credit = FilmographyCredit(
        actor_id=profile.id,
        category=matched_category,
        production_name=credit_in.production_name,
        role_name=credit_in.role_name,
        director=credit_in.director,
        year=credit_in.year,
        additional_notes=credit_in.additional_notes,
    )
    db.add(credit)
    db.commit()
    db.refresh(credit)
    return credit


@router.delete("/{credit_id}", status_code=204)
def delete_credit(
    credit_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(ActorProfile).filter(ActorProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor profile not found",
        )

    credit = (
        db.query(FilmographyCredit)
        .filter(
            FilmographyCredit.id == credit_id,
            FilmographyCredit.actor_id == profile.id,
        )
        .first()
    )
    if not credit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit entry not found",
        )

    db.delete(credit)
    db.commit()
    return None
