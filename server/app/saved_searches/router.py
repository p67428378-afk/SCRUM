import json
import uuid
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.app.database import get_db
from server.app import models, schemas
from server.app.auth.utils import get_current_user

router = APIRouter(prefix="/api/v1/saved-searches", tags=["saved-searches"])


@router.get("", response_model=List[schemas.SavedSearchResponse])
def get_saved_searches(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    searches = (
        db.query(models.SavedSearch)
        .filter(models.SavedSearch.user_id == current_user.id)
        .all()
    )
    results = []
    for s in searches:
        s_res = (
            schemas.SavedSearchResponse.model_validate(s)
            if hasattr(schemas.SavedSearchResponse, "model_validate")
            else schemas.SavedSearchResponse.from_orm(s)
        )
        results.append(s_res)
    return results


@router.post(
    "", response_model=schemas.SavedSearchResponse, status_code=status.HTTP_201_CREATED
)
def create_saved_search(
    search_in: schemas.SavedSearchCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    filter_criteria_json = json.dumps(search_in.filter_criteria)
    saved_search = models.SavedSearch(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=search_in.name,
        filter_criteria=filter_criteria_json,
        created_at=datetime.utcnow(),
    )
    db.add(saved_search)
    db.commit()
    db.refresh(saved_search)

    return saved_search


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_search(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    search_item = (
        db.query(models.SavedSearch)
        .filter(
            models.SavedSearch.id == id, models.SavedSearch.user_id == current_user.id
        )
        .first()
    )

    if not search_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Saved search not found"
        )

    db.delete(search_item)
    db.commit()
    return None
