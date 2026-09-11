from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from server.database import get_db
from server.models import CollectionRoute, RouteTask, User
from server.schemas import (
    CollectionRouteCreate,
    CollectionRouteResponse,
    RouteTaskUpdate,
    RouteTaskResponse,
)
from server.auth import get_current_user

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.get("", response_model=List[CollectionRouteResponse])
def list_routes(
    driver_id: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(CollectionRoute)
    if current_user.role == "Driver":
        query = query.filter(CollectionRoute.driver_id == current_user.id)
    elif driver_id:
        query = query.filter(CollectionRoute.driver_id == driver_id)

    if zone:
        query = query.filter(CollectionRoute.zone_code == zone)

    return query.offset(skip).limit(limit).all()


@router.post(
    "", response_model=CollectionRouteResponse, status_code=status.HTTP_201_CREATED
)
def create_route(route_in: CollectionRouteCreate, db: Session = Depends(get_db)):
    route = CollectionRoute(
        id=str(uuid.uuid4()),
        driver_id=route_in.driver_id,
        route_name=route_in.route_name,
        zone_code=route_in.zone_code,
        scheduled_date=route_in.scheduled_date,
        status="Pending",
    )
    db.add(route)
    db.commit()

    seq = 1
    if route_in.bin_ids:
        for bin_id in route_in.bin_ids:
            task = RouteTask(
                id=str(uuid.uuid4()),
                route_id=route.id,
                bin_id=bin_id,
                sequence_number=seq,
                task_status="Pending",
            )
            db.add(task)
            seq += 1

    if route_in.pickup_ids:
        for p_id in route_in.pickup_ids:
            task = RouteTask(
                id=str(uuid.uuid4()),
                route_id=route.id,
                pickup_id=p_id,
                sequence_number=seq,
                task_status="Pending",
            )
            db.add(task)
            seq += 1

    db.commit()
    db.refresh(route)
    return route


@router.get("/{route_id}", response_model=CollectionRouteResponse)
def get_route(route_id: str, db: Session = Depends(get_db)):
    route = db.query(CollectionRoute).filter(CollectionRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Collection route not found")
    return route


@router.patch("/tasks/{task_id}", response_model=RouteTaskResponse)
def update_task_status(
    task_id: str, task_update: RouteTaskUpdate, db: Session = Depends(get_db)
):
    task = db.query(RouteTask).filter(RouteTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Route task not found")

    if task_update.task_status is not None:
        task.task_status = task_update.task_status
        if task_update.task_status == "Completed" and task.bin:
            task.bin.fill_level_pct = 0
            task.bin.status = "Empty"
        if task_update.task_status == "Completed" and task.pickup:
            task.pickup.status = "Completed"

    if task_update.collected_weight_kg is not None:
        task.collected_weight_kg = task_update.collected_weight_kg
    if task_update.skip_reason is not None:
        task.skip_reason = task_update.skip_reason
    if task_update.evidence_url is not None:
        task.evidence_url = task_update.evidence_url

    db.commit()
    db.refresh(task)
    return task
