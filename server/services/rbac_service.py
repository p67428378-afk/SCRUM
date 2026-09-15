from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException
from server.models import TenantMembership, User, Tenant
from server.schemas import UserInvite, UserMembershipResponse
from server.services.audit_service import log_audit_event


def list_tenant_users(
    db: Session, tenant_id: str, skip: int = 0, limit: int = 50
) -> List[UserMembershipResponse]:
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")

    memberships = (
        db.query(TenantMembership)
        .filter(TenantMembership.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for m in memberships:
        user = db.query(User).filter(User.id == m.user_id).first()
        result.append(
            UserMembershipResponse(
                id=m.id,
                tenant_id=m.tenant_id,
                user_id=m.user_id,
                role=m.role,
                status=m.status,
                email=user.email if user else None,
                full_name=user.full_name if user else None,
                created_at=m.created_at,
            )
        )
    return result


def invite_user(
    db: Session, tenant_id: str, data: UserInvite
) -> UserMembershipResponse:
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")

    # Find or create user
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        user = User(
            email=data.email, full_name=data.full_name, is_active=True, is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Check duplicate membership
    existing_membership = (
        db.query(TenantMembership)
        .filter(
            TenantMembership.tenant_id == tenant_id,
            TenantMembership.user_id == user.id,
            TenantMembership.status == "Active",
        )
        .first()
    )
    if existing_membership:
        raise HTTPException(
            status_code=409, detail="User is already a member of this tenant."
        )

    membership = TenantMembership(
        tenant_id=tenant_id,
        user_id=user.id,
        role=data.role or "User",
        status="Active",
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)

    log_audit_event(
        db=db,
        tenant_id=tenant_id,
        action="INVITE_USER",
        entity_type="User",
        entity_id=user.id,
        details={"email": user.email, "role": membership.role},
    )

    return UserMembershipResponse(
        id=membership.id,
        tenant_id=membership.tenant_id,
        user_id=membership.user_id,
        role=membership.role,
        status=membership.status,
        email=user.email,
        full_name=user.full_name,
        created_at=membership.created_at,
    )


def revoke_user(db: Session, tenant_id: str, user_id: str) -> Dict[str, Any]:
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")

    membership = (
        db.query(TenantMembership)
        .filter(
            TenantMembership.tenant_id == tenant_id,
            or_(TenantMembership.user_id == user_id, TenantMembership.id == user_id),
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=404,
            detail=f"User membership for user '{user_id}' not found in tenant '{tenant_id}'.",
        )

    actor_id = membership.user_id
    db.delete(membership)
    db.commit()

    log_audit_event(
        db=db,
        tenant_id=tenant_id,
        action="REVOKE_USER",
        entity_type="User",
        entity_id=actor_id,
        details={"revoked_user_id": user_id},
    )

    return {"message": "User membership revoked successfully"}
