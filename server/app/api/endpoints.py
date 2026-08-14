from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from server.app import crud, schemas, database
from server.app.config import settings

router = APIRouter()


@router.post("/alerts/register", response_model=schemas.AlertRegisterResponse)
def register_alert(
    payload: schemas.AlertRegisterRequest, db: Session = Depends(database.get_db)
):
    card_num = payload.cardNumber
    mobile_num = payload.mobileNumber

    # PCI-DSS Compliance: Do not store full card number.
    # Validate card exists in CMS
    if card_num not in settings.MOCK_CMS_CARDS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Card not found in system"
        )

    # Validate mobile number matches registered mobile number
    registered_mobile = settings.MOCK_CMS_CARDS[card_num]
    if mobile_num != registered_mobile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number does not match registered card mobile number",
        )

    # Create OTP transaction
    otp_tx = crud.create_otp_transaction(db, mobile_number=mobile_num)

    # In a real system, we would trigger SMS sending here.
    # For this microservice, we return the reference ID.
    return schemas.AlertRegisterResponse(
        otpReferenceId=otp_tx.otp_reference_id, status="PENDING_VERIFICATION"
    )


@router.post("/otp/send", response_model=schemas.OTPSendResponse)
def send_otp(payload: schemas.OTPSendRequest, db: Session = Depends(database.get_db)):
    # Create OTP transaction
    otp_tx = crud.create_otp_transaction(db, mobile_number=payload.mobileNumber)
    return schemas.OTPSendResponse(
        otpReferenceId=otp_tx.otp_reference_id, status="SENT"
    )


@router.post("/otp/verify", response_model=schemas.OTPVerifyResponse)
def verify_otp(
    payload: schemas.OTPVerifyRequest, db: Session = Depends(database.get_db)
):
    card_num = payload.cardNumber
    mobile_num = payload.mobileNumber
    card_identifier = card_num[-4:]

    # Verify OTP
    is_valid = crud.verify_otp(
        db,
        otp_reference_id=payload.otpReferenceId,
        otp_code=payload.otpCode,
        mobile_number=mobile_num,
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code",
        )

    # Activate spend alert rule in CMS (our database)
    alert_rule = crud.create_or_update_alert_rule(
        db,
        card_identifier=card_identifier,
        daily_spend_threshold=payload.dailySpendThreshold,
        alert_delivery_channel=payload.alertDeliveryChannel,
    )

    return schemas.OTPVerifyResponse(
        alertDeliveryChannel=alert_rule.alert_delivery_channel,
        cardIdentifier=alert_rule.card_identifier,
        dailySpendThreshold=float(alert_rule.daily_spend_threshold),
        status=alert_rule.status,
    )


@router.get("/alerts", response_model=list[schemas.AlertRuleResponse])
def get_alerts(db: Session = Depends(database.get_db)):
    alerts = crud.get_all_active_alerts(db)
    return [
        schemas.AlertRuleResponse(
            alert_delivery_channel=a.alert_delivery_channel,
            card_identifier=a.card_identifier,
            current_daily_spend=float(a.current_daily_spend),
            daily_spend_threshold=float(a.daily_spend_threshold),
            status=a.status,
        )
        for a in alerts
    ]


@router.post("/alerts/simulate-spend", response_model=schemas.SimulateSpendResponse)
def simulate_spend(
    payload: schemas.SimulateSpendRequest, db: Session = Depends(database.get_db)
):
    card_num = payload.cardNumber
    card_identifier = card_num[-4:]

    alert_rule, breached, sms_message = crud.record_spend(
        db, card_identifier, payload.amount
    )

    if not alert_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active spend alert rule not found for this card",
        )

    return schemas.SimulateSpendResponse(
        status=alert_rule.status,
        breached=breached,
        sms_sent=breached,
        message=sms_message
        if breached
        else "Transaction processed successfully. Spend is within threshold.",
    )


# --- Secure Employee Account Management Endpoints ---


@router.post(
    "/admin/users",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    payload: schemas.UserCreateRequest, db: Session = Depends(database.get_db)
):
    try:
        user = crud.create_user(db, payload)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/admin/users/{user_id}", response_model=schemas.UserDetailResponse)
def get_user(user_id: str, db: Session = Depends(database.get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.put("/admin/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: str,
    payload: schemas.UserUpdateRequest,
    db: Session = Depends(database.get_db),
):
    try:
        user = crud.update_user(db, user_id, payload)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/admin/users/{user_id}", response_model=schemas.UserDeactivateResponse)
def deactivate_user(user_id: str, db: Session = Depends(database.get_db)):
    user = crud.deactivate_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return schemas.UserDeactivateResponse(message="User deactivated successfully")


@router.get("/admin/roles", response_model=List[schemas.RoleWithPermissions])
def get_roles(db: Session = Depends(database.get_db)):
    return crud.get_roles(db)


@router.post(
    "/admin/roles", response_model=schemas.RoleBase, status_code=status.HTTP_201_CREATED
)
def create_role(
    payload: schemas.RoleCreateRequest, db: Session = Depends(database.get_db)
):
    try:
        role = crud.create_role(db, payload)
        return role
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put(
    "/admin/users/{user_id}/roles", response_model=schemas.UserRolesUpdateResponse
)
def assign_user_roles(
    user_id: str,
    payload: schemas.UserRolesUpdateRequest,
    db: Session = Depends(database.get_db),
):
    try:
        user = crud.assign_user_roles(db, user_id, payload.role_ids)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return schemas.UserRolesUpdateResponse(user_id=user.id, roles=user.roles)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/admin/permissions", response_model=List[schemas.PermissionBase])
def get_permissions(db: Session = Depends(database.get_db)):
    return crud.get_permissions(db)


@router.patch(
    "/admin/users/{user_id}/permissions",
    response_model=schemas.UserPermissionsUpdateResponse,
)
def update_user_permissions(
    user_id: str,
    payload: schemas.UserPermissionsUpdateRequest,
    db: Session = Depends(database.get_db),
):
    try:
        user = crud.update_user_permissions(db, user_id, payload.permission_ids)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return schemas.UserPermissionsUpdateResponse(
            user_id=user.id, permissions=user.permissions
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch(
    "/admin/roles/{role_id}/permissions",
    response_model=schemas.RolePermissionsUpdateResponse,
)
def update_role_permissions(
    role_id: str,
    payload: schemas.RolePermissionsUpdateRequest,
    db: Session = Depends(database.get_db),
):
    try:
        role = crud.update_role_permissions(db, role_id, payload.permission_ids)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
            )
        return schemas.RolePermissionsUpdateResponse(
            role_id=role.id, permissions=role.permissions
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/admin/dashboard/users", response_model=schemas.DashboardUsersResponse)
def get_dashboard_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(database.get_db),
):
    users, total = crud.get_dashboard_users(
        db, skip=skip, limit=limit, search=search, role=role, status=status
    )

    user_items = []
    for u in users:
        user_items.append(
            schemas.DashboardUserItem(
                id=u.id,
                employee_id=u.employee_id,
                first_name=u.first_name,
                last_name=u.last_name,
                email=u.email,
                status=u.status,
                created_at=u.created_at,
                roles=[r.name for r in u.roles],
            )
        )
    return schemas.DashboardUsersResponse(total=total, users=user_items)


@router.get("/admin/dashboard/roles", response_model=schemas.DashboardRolesResponse)
def get_dashboard_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(database.get_db),
):
    roles, total = crud.get_dashboard_roles(db, skip=skip, limit=limit)

    role_items = []
    for r in roles:
        role_items.append(
            schemas.DashboardRoleItem(
                id=r.id,
                name=r.name,
                description=r.description,
                permissions=[p.name for p in r.permissions],
            )
        )
    return schemas.DashboardRolesResponse(total=total, roles=role_items)


@router.get(
    "/admin/dashboard/audit-logs", response_model=schemas.DashboardAuditLogsResponse
)
def get_dashboard_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    action_type: Optional[str] = None,
    actor_id: Optional[str] = None,
    db: Session = Depends(database.get_db),
):
    logs, total = crud.get_audit_logs(
        db, skip=skip, limit=limit, action_type=action_type, actor_id=actor_id
    )
    return schemas.DashboardAuditLogsResponse(total=total, logs=logs)
