from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from server.app.models.zone import Zone
from server.app.models.utility_metric import UtilityMetric
from server.app.schemas.zone import ZoneCreate
from server.app.schemas.utility_metric import UtilityMetricCreate


class ZoneService:
    @staticmethod
    def get_zones(
        db: Session, skip: int = 0, limit: int = 20, status: Optional[str] = None
    ) -> Tuple[List[Zone], int]:
        query = db.query(Zone)
        if status:
            query = query.filter(Zone.status == status)
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_zone_by_id(db: Session, zone_id: str) -> Optional[Zone]:
        return db.query(Zone).filter(Zone.id == zone_id).first()

    @staticmethod
    def get_zone_by_code(db: Session, zone_code: str) -> Optional[Zone]:
        return db.query(Zone).filter(Zone.zone_code == zone_code).first()

    @staticmethod
    def create_zone(db: Session, zone_in: ZoneCreate) -> Zone:
        db_zone = Zone(
            zone_code=zone_in.zone_code,
            name=zone_in.name,
            description=zone_in.description,
            status=zone_in.status or "ACTIVE",
        )
        db.add(db_zone)
        db.commit()
        db.refresh(db_zone)
        return db_zone

    @staticmethod
    def get_utility_metrics_for_zone(db: Session, zone_id: str) -> List[UtilityMetric]:
        return (
            db.query(UtilityMetric)
            .filter(UtilityMetric.zone_id == zone_id)
            .order_by(UtilityMetric.recorded_at.desc())
            .all()
        )

    @staticmethod
    def add_utility_metric(
        db: Session, zone_id: str, metric_in: UtilityMetricCreate
    ) -> UtilityMetric:
        db_metric = UtilityMetric(
            zone_id=zone_id,
            metric_type=metric_in.metric_type,
            value=metric_in.value,
            unit=metric_in.unit,
        )
        db.add(db_metric)
        db.commit()
        db.refresh(db_metric)
        return db_metric
