from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import UserInvite, UserMembershipResponse
from server.services import rbac_service
from server.middleware.tenant_context import get_tenant_context

router = APIRouter(prefix="/api/v1/tenants", tags=["Users & RBAC"])


@router.get("/{tenant_id}/users", response_model=List[UserMembershipResponse])
def list_tenant_users(
    tenant_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    tenant_ctx=Depends(get_tenant_context),
):
    return rbac_service.list_tenant_users(db, tenant_id, skip=skip, limit=limit)


@router.post(
    "/{tenant_id}/users",
    response_model=UserMembershipResponse,
    status_code=status.HTTP_201_CREATED,
)
def invite_user(
    tenant_id: str,
    data: UserInvite,
    db: Session = Depends(get_db),
    tenant_ctx=Depends(get_tenant_context),
):
    return rbac_service.invite_user(db, tenant_id, data)


@router.delete("/{tenant_id}/users/{user_id}")
def revoke_user(
    tenant_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    tenant_ctx=Depends(get_tenant_context),
):
    return rbac_service.revoke_user(db, tenant_id, user_id)
