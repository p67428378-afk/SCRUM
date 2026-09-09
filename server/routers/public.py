from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import ActorProfile, MediaAsset, FilmographyCredit
from server.schemas import PublicPortfolioOut, ProfileOut, MediaOut, CreditOut

router = APIRouter(prefix="/api/v1/public/actors", tags=["Public Portfolio"])

CATEGORIES = ["Theater", "Film", "Television", "Commercials", "Voiceover"]


@router.get("/{slug}", response_model=PublicPortfolioOut)
def get_public_portfolio(slug: str, db: Session = Depends(get_db)):
    profile = db.query(ActorProfile).filter(ActorProfile.slug == slug).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Actor portfolio not found for slug '{slug}'",
        )

    # Fetch media assets
    media_assets = db.query(MediaAsset).filter(MediaAsset.actor_id == profile.id).all()

    primary_headshot_url = None
    pdf_resume_url = None

    for media in media_assets:
        if media.asset_type == "headshot" and media.is_primary:
            primary_headshot_url = media.url
        elif media.asset_type == "pdf_resume" and not pdf_resume_url:
            pdf_resume_url = media.url

    # Fallback to first headshot if no primary headshot set
    if not primary_headshot_url:
        first_headshot = next(
            (m for m in media_assets if m.asset_type == "headshot"), None
        )
        if first_headshot:
            primary_headshot_url = first_headshot.url

    # Fetch credits
    credits_list = (
        db.query(FilmographyCredit)
        .filter(FilmographyCredit.actor_id == profile.id)
        .order_by(FilmographyCredit.year.desc(), FilmographyCredit.created_at.desc())
        .all()
    )

    grouped_credits: Dict[str, List[CreditOut]] = {cat: [] for cat in CATEGORIES}
    for credit in credits_list:
        cat_key = credit.category
        if cat_key not in grouped_credits:
            grouped_credits[cat_key] = []
        grouped_credits[cat_key].append(CreditOut.model_validate(credit))

    return PublicPortfolioOut(
        profile=ProfileOut.model_validate(profile),
        primary_headshot_url=primary_headshot_url,
        media_gallery=[MediaOut.model_validate(m) for m in media_assets],
        pdf_resume_url=pdf_resume_url,
        credits=grouped_credits,
    )
