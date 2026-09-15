from typing import Optional
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import Tenant


def get_tenant_context(
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID"),
    db: Session = Depends(get_db),
) -> Optional[Tenant]:
    if not x_tenant_id:
        return None

    tenant = db.query(Tenant).filter(Tenant.id == x_tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=401, detail="Invalid tenant context header.")

    if tenant.status in ["Suspended", "Deactivated"]:
        raise HTTPException(
            status_code=403, detail=f"Tenant is {tenant.status.lower()}."
        )

    return tenant
