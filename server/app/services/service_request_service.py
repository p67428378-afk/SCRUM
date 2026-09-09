import random
from typing import Optional, List, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from server.app.models.service_request import ServiceRequest
from server.app.schemas.service_request import (
    ServiceRequestCreate,
    ServiceRequestStatusUpdate,
)


def generate_ticket_number() -> str:
    rand_num = random.randint(10000, 99999)
    return f"SR-{datetime.now().year}-{rand_num}"


class ServiceRequestService:
    @staticmethod
    def create_service_request(
        db: Session, request_in: ServiceRequestCreate
    ) -> ServiceRequest:
        ticket_num = generate_ticket_number()
        # Default assigned department based on category if not specified
        assigned_dept = "PUBLIC_WORKS"
        if request_in.category == "ROAD_MAINTENANCE":
            assigned_dept = "DEPT_OF_TRANSPORTATION"
        elif request_in.category == "WASTE_MANAGEMENT":
            assigned_dept = "SANITATION_DEPT"

        db_request = ServiceRequest(
            ticket_number=ticket_num,
            citizen_id=request_in.citizen_id,
            zone_id=request_in.zone_id,
            title=request_in.title,
            description=request_in.description,
            category=request_in.category,
            priority=request_in.priority or "MEDIUM",
            status="SUBMITTED",
            assigned_department=assigned_dept,
        )
        db.add(db_request)
        db.commit()
        db.refresh(db_request)
        return db_request

    @staticmethod
    def get_service_requests(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        zone_id: Optional[str] = None,
        category: Optional[str] = None,
        priority: Optional[str] = None,
    ) -> Tuple[List[ServiceRequest], int]:
        query = db.query(ServiceRequest)
        if status:
            query = query.filter(ServiceRequest.status == status)
        if zone_id:
            query = query.filter(ServiceRequest.zone_id == zone_id)
        if category:
            query = query.filter(ServiceRequest.category == category)
        if priority:
            query = query.filter(ServiceRequest.priority == priority)

        total = query.count()
        items = (
            query.order_by(ServiceRequest.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total

    @staticmethod
    def get_service_request_by_id(
        db: Session, request_id: str
    ) -> Optional[ServiceRequest]:
        return db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()

    @staticmethod
    def update_service_request_status(
        db: Session, request_id: str, status_update: ServiceRequestStatusUpdate
    ) -> Optional[ServiceRequest]:
        db_request = (
            db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
        )
        if not db_request:
            return None

        db_request.status = status_update.status
        if status_update.assigned_department:
            db_request.assigned_department = status_update.assigned_department
        if status_update.notes:
            db_request.notes = status_update.notes

        db_request.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_request)
        return db_request
