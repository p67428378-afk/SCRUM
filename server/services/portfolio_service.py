from sqlalchemy.orm import Session, joinedload
from server.models import Artist
from fastapi import HTTPException, status


def get_artist_portfolio(db: Session):
    # Eager load discography to avoid N+1 queries
    artist = db.query(Artist).options(joinedload(Artist.discography)).first()
    if not artist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Artist profile not found"
        )
    return artist
