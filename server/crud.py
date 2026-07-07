from sqlalchemy.orm import Session
from . import models


def get_kpis(db: Session):
    return db.query(models.KPI).order_by(models.KPI.created_at.desc()).first()


def get_skus(db: Session):
    return db.query(models.SKU).all()


def get_scenario_by_name(db: Session, name: str):
    return db.query(models.Scenario).filter(models.Scenario.name.ilike(name)).first()


def create_review(db: Session, scenario_name: str, audit_trail: str):
    db_review = models.Review(scenario_name=scenario_name, audit_trail=audit_trail)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review
