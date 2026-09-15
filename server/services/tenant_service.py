from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException
from server.models import Tenant, User, TenantMembership, TenantConfig
from server.schemas import TenantCreate
from server.services.audit_service import log_audit_event


def onboard_tenant(db: Session, data: TenantCreate) -> Tenant:
    domain_val = data.domain or f"{data.slug}.com"

    # Check duplicate domain or slug
    existing = (
        db.query(Tenant)
        .filter(or_(Tenant.slug == data.slug, Tenant.domain == domain_val))
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409, detail="Tenant with this domain or slug already exists."
        )

    tenant = Tenant(
        name=data.name,
        slug=data.slug,
        domain=domain_val,
        status="Active",
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    # Initialize Tenant Config
    config = TenantConfig(
        tenant_id=tenant.id,
        rate_limit_rpm=data.rate_limit_rpm or 1000,
        storage_quota_gb=data.storage_quota_gb or 50,
        feature_flags={},
    )
    db.add(config)

    # Create admin user if provided
    if data.admin_email:
        user = db.query(User).filter(User.email == data.admin_email).first()
        if not user:
            user = User(
                email=data.admin_email,
                full_name=data.admin_full_name or "Tenant Admin",
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        membership = TenantMembership(
            tenant_id=tenant.id,
            user_id=user.id,
            role="Tenant Admin",
            status="Active",
        )
        db.add(membership)

    db.commit()
    db.refresh(tenant)

    log_audit_event(
        db=db,
        tenant_id=tenant.id,
        action="ONBOARD_TENANT",
        entity_type="Tenant",
        entity_id=tenant.id,
        details={"name": tenant.name, "slug": tenant.slug},
    )

    return tenant


def list_tenants(
    db: Session, skip: int = 0, limit: int = 20, status: Optional[str] = None
) -> List[Tenant]:
    query = db.query(Tenant)
    if status:
        query = query.filter(Tenant.status == status)
    return query.offset(skip).limit(limit).all()


def get_tenant_details(db: Session, tenant_id: str) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")
    return tenant


def update_tenant_status(db: Session, tenant_id: str, new_status: str) -> Tenant:
    if new_status not in ["Active", "Suspended", "Deactivated"]:
        raise HTTPException(status_code=400, detail="Invalid tenant status.")

    tenant = get_tenant_details(db, tenant_id)
    old_status = tenant.status
    tenant.status = new_status
    db.commit()
    db.refresh(tenant)

    log_audit_event(
        db=db,
        tenant_id=tenant.id,
        action="UPDATE_TENANT_STATUS",
        entity_type="Tenant",
        entity_id=tenant.id,
        details={"old_status": old_status, "new_status": new_status},
    )

    return tenant
