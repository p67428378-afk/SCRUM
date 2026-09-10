import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import SubmissionAudit
from server.schemas import SubmissionCreateRequest, SubmissionResponse

router = APIRouter(prefix="/api/v1/submissions", tags=["submissions"])


@router.get("", response_model=List[SubmissionResponse])
def get_submissions(db: Session = Depends(get_db)):
    audits = db.query(SubmissionAudit).order_by(SubmissionAudit.submitted_at.desc()).all()
    results = []
    for a in audits:
        total = a.grow_count + a.maintain_count + a.swap_count + a.reduce_count
        results.append(
            SubmissionResponse(
                audit_code=a.audit_code,
                message="Assortment submission record.",
                user_id=a.user_id,
                scenario_type=a.selected_scenario,
                total_sku_actions=total,
                submitted_at=a.submitted_at
            )
        )
    return results


@router.get("/{audit_code}", response_model=SubmissionResponse)
def get_submission_by_code(audit_code: str, db: Session = Depends(get_db)):
    audit = db.query(SubmissionAudit).filter(SubmissionAudit.audit_code == audit_code).first()
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission with audit code '{audit_code}' not found"
        )
    total = audit.grow_count + audit.maintain_count + audit.swap_count + audit.reduce_count
    return SubmissionResponse(
        audit_code=audit.audit_code,
        message="Assortment submission record.",
        user_id=audit.user_id,
        scenario_type=audit.selected_scenario,
        total_sku_actions=total,
        submitted_at=audit.submitted_at
    )


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_assortment_plan(payload: SubmissionCreateRequest, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y%m%d")
    unique_suffix = uuid.uuid4().hex[:6].upper()
    audit_code = f"AUD-{date_str}-{unique_suffix}"

    actions = payload.actions_summary
    grow_cnt = actions.grow if actions else 12
    maint_cnt = actions.maintain if actions else 10
    swap_cnt = actions.swap if actions else 4
    reduce_cnt = actions.reduce if actions else 2
    total_actions = grow_cnt + maint_cnt + swap_cnt + reduce_cnt

    audit_entry = SubmissionAudit(
        id=str(uuid.uuid4()),
        audit_code=audit_code,
        user_id=payload.user_id or "category_mgr_01",
        cluster_name=payload.cluster_name or "Small Town Value Cluster",
        category="Snacks",
        selected_scenario=payload.scenario_type or "Balanced",
        grow_count=grow_cnt,
        maintain_count=maint_cnt,
        swap_count=swap_cnt,
        reduce_count=reduce_cnt,
        guardrail_status="PASSED",
        submitted_at=now
    )

    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)

    return SubmissionResponse(
        audit_code=audit_entry.audit_code,
        message="Assortment changes submitted successfully.",
        user_id=audit_entry.user_id,
        scenario_type=audit_entry.selected_scenario,
        total_sku_actions=total_actions,
        submitted_at=audit_entry.submitted_at
    )
