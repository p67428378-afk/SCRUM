import random
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server.app import models, schemas


def generate_otp() -> str:
    # Generate a 6-digit OTP
    return f"{random.randint(100000, 999999)}"


def create_otp_transaction(db: Session, mobile_number: str) -> models.OTPTransaction:
    otp_code = generate_otp()
    otp_reference_id = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(minutes=5)  # OTP valid for 5 minutes

    db_otp = models.OTPTransaction(
        otp_reference_id=otp_reference_id,
        mobile_number=mobile_number,
        otp_code=otp_code,
        expires_at=expires_at,
        is_verified=False,
    )
    db.add(db_otp)
    db.commit()
    db.refresh(db_otp)
    return db_otp


def verify_otp(
    db: Session, otp_reference_id: str, otp_code: str, mobile_number: str
) -> bool:
    db_otp = (
        db.query(models.OTPTransaction)
        .filter(
            models.OTPTransaction.otp_reference_id == otp_reference_id,
            models.OTPTransaction.mobile_number == mobile_number,
            models.OTPTransaction.is_verified == False,
        )
        .first()
    )

    if not db_otp:
        return False

    if db_otp.expires_at < datetime.utcnow():
        return False

    if db_otp.otp_code != otp_code:
        return False

    db_otp.is_verified = True  # type: ignore
    db.commit()
    return True


def get_alert_rule_by_card(
    db: Session, card_identifier: str
) -> Optional[models.AlertRule]:
    return (
        db.query(models.AlertRule)
        .filter(models.AlertRule.card_identifier == card_identifier)
        .first()
    )  # type: ignore


def create_or_update_alert_rule(
    db: Session,
    card_identifier: str,
    daily_spend_threshold: float,
    alert_delivery_channel: str,
) -> models.AlertRule:
    db_alert = get_alert_rule_by_card(db, card_identifier)
    if db_alert:
        db_alert.daily_spend_threshold = daily_spend_threshold  # type: ignore
        db_alert.alert_delivery_channel = alert_delivery_channel  # type: ignore
        db_alert.status = "ACTIVE"  # type: ignore
        db_alert.updated_at = datetime.utcnow()  # type: ignore
    else:
        db_alert = models.AlertRule(
            card_identifier=card_identifier,
            daily_spend_threshold=daily_spend_threshold,
            alert_delivery_channel=alert_delivery_channel,
            status="ACTIVE",
            current_daily_spend=0,
        )
        db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


def get_all_active_alerts(db: Session) -> list[models.AlertRule]:
    return db.query(models.AlertRule).filter(models.AlertRule.status == "ACTIVE").all()


def record_spend(
    db: Session, card_identifier: str, amount: float
) -> tuple[Optional[models.AlertRule], bool, str]:
    """
    Records a spend transaction.
    Returns (alert_rule, breached, sms_message)
    """
    db_alert = get_alert_rule_by_card(db, card_identifier)
    if not db_alert or db_alert.status != "ACTIVE":
        return None, False, ""  # type: ignore

    old_spend = float(db_alert.current_daily_spend)
    new_spend = old_spend + amount
    db_alert.current_daily_spend = new_spend  # type: ignore
    db_alert.updated_at = datetime.utcnow()  # type: ignore

    breached = False
    sms_message = ""
    threshold = float(db_alert.daily_spend_threshold)

    # Check if cumulative daily spending exceeds the configured threshold
    if new_spend > threshold:
        breached = True
        db_alert.status = "BREACHED"  # type: ignore
        sms_message = (
            f"ALERT: Cumulative daily spend on card ending in {card_identifier} "
            f"has reached {new_spend:.2f} INR, exceeding your configured threshold of {threshold:.2f} INR."
        )

    db.commit()
    db.refresh(db_alert)
    return db_alert, breached, sms_message


# --- Secure Employee Account Management CRUD ---


def create_audit_log(
    db: Session,
    action_type: str,
    actor_id: Optional[str],
    target_id: Optional[str],
    details: str,
) -> models.AuditLog:
    db_log = models.AuditLog(
        action_type=action_type, actor_id=actor_id, target_id=target_id, details=details
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def create_user(db: Session, user_in: schemas.UserCreateRequest) -> models.User:
    # Check if employee_id or email already exists
    existing_emp = (
        db.query(models.User)
        .filter(models.User.employee_id == user_in.employee_id)
        .first()
    )
    if existing_emp:
        raise ValueError("Employee ID already exists")

    existing_email = (
        db.query(models.User).filter(models.User.email == user_in.email).first()
    )
    if existing_email:
        raise ValueError("Email already exists")

    db_user = models.User(
        employee_id=user_in.employee_id,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        email=user_in.email,
        status=user_in.status or "ACTIVE",
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create audit log
    create_audit_log(
        db,
        action_type="USER_CREATED",
        actor_id=None,  # System or current admin (none for now as we don't have auth context)
        target_id=db_user.id,  # type: ignore
        details=f"New user {db_user.first_name} {db_user.last_name} ({db_user.employee_id}) created",
    )

    return db_user


def get_user(db: Session, user_id: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def update_user(
    db: Session, user_id: str, user_in: schemas.UserUpdateRequest
) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    # Check if email is being updated and already exists
    if user_in.email != db_user.email:
        existing_email = (
            db.query(models.User).filter(models.User.email == user_in.email).first()
        )
        if existing_email:
            raise ValueError("Email already exists")

    db_user.first_name = user_in.first_name  # type: ignore
    db_user.last_name = user_in.last_name  # type: ignore
    db_user.email = user_in.email  # type: ignore
    db_user.status = user_in.status  # type: ignore
    db_user.updated_at = datetime.utcnow()  # type: ignore

    db.commit()
    db.refresh(db_user)

    # Create audit log
    create_audit_log(
        db,
        action_type="USER_UPDATED",
        actor_id=None,
        target_id=db_user.id,  # type: ignore
        details=f"User {db_user.employee_id} details updated",
    )

    return db_user


def deactivate_user(db: Session, user_id: str) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    db_user.status = "INACTIVE"  # type: ignore
    db_user.updated_at = datetime.utcnow()  # type: ignore
    db.commit()
    db.refresh(db_user)

    # Create audit log
    create_audit_log(
        db,
        action_type="USER_DEACTIVATED",
        actor_id=None,
        target_id=db_user.id,  # type: ignore
        details=f"User {db_user.employee_id} deactivated",
    )

    return db_user


def get_roles(db: Session) -> List[models.Role]:
    return db.query(models.Role).all()


def create_role(db: Session, role_in: schemas.RoleCreateRequest) -> models.Role:
    existing_role = (
        db.query(models.Role).filter(models.Role.name == role_in.name).first()
    )
    if existing_role:
        raise ValueError("Role name already exists")

    db_role = models.Role(name=role_in.name, description=role_in.description)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)

    # Create audit log
    create_audit_log(
        db,
        action_type="ROLE_CREATED",
        actor_id=None,
        target_id=db_role.id,  # type: ignore
        details=f"New role '{db_role.name}' created",
    )

    return db_role


def assign_user_roles(
    db: Session, user_id: str, role_ids: List[str]
) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    # Verify all role_ids exist
    roles = db.query(models.Role).filter(models.Role.id.in_(role_ids)).all()
    print(
        "CRUD ASSIGN ROLES:",
        [r.id for r in roles],
        "INPUT:",
        role_ids,
        "DB BIND:",
        db.get_bind().url,
        "ALL ROLES IN DB:",
        [(r.id, r.name) for r in db.query(models.Role).all()],
    )
    if len(roles) != len(role_ids):
        raise ValueError("One or more role IDs do not exist")

    db_user.roles = roles  # type: ignore
    db_user.updated_at = datetime.utcnow()  # type: ignore
    db.commit()
    db.refresh(db_user)

    # Create audit log
    role_names = ", ".join([str(r.name) for r in roles])
    create_audit_log(
        db,
        action_type="ROLE_ASSIGNED",
        actor_id=None,
        target_id=db_user.id,  # type: ignore
        details=f"Roles assigned to user {db_user.employee_id}: {role_names}",
    )

    return db_user


def get_permissions(db: Session) -> List[models.Permission]:
    return db.query(models.Permission).all()


def update_user_permissions(
    db: Session, user_id: str, permission_ids: List[str]
) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    # Verify all permission_ids exist
    permissions = (
        db.query(models.Permission)
        .filter(models.Permission.id.in_(permission_ids))
        .all()
    )
    if len(permissions) != len(permission_ids):
        raise ValueError("One or more permission IDs do not exist")

    db_user.permissions = permissions  # type: ignore
    db_user.updated_at = datetime.utcnow()  # type: ignore
    db.commit()
    db.refresh(db_user)

    # Create audit log
    perm_names = ", ".join([str(p.name) for p in permissions])
    create_audit_log(
        db,
        action_type="PERMISSION_MODIFIED",
        actor_id=None,
        target_id=db_user.id,  # type: ignore
        details=f"Direct permissions modified for user {db_user.employee_id}: {perm_names}",
    )

    return db_user


def update_role_permissions(
    db: Session, role_id: str, permission_ids: List[str]
) -> Optional[models.Role]:
    db_role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not db_role:
        return None

    # Verify all permission_ids exist
    permissions = (
        db.query(models.Permission)
        .filter(models.Permission.id.in_(permission_ids))
        .all()
    )
    if len(permissions) != len(permission_ids):
        raise ValueError("One or more permission IDs do not exist")

    db_role.permissions = permissions  # type: ignore
    db_role.updated_at = datetime.utcnow()  # type: ignore
    db.commit()
    db.refresh(db_role)

    # Create audit log
    perm_names = ", ".join([str(p.name) for p in permissions])
    create_audit_log(
        db,
        action_type="PERMISSION_MODIFIED",
        actor_id=None,
        target_id=db_role.id,  # type: ignore
        details=f"Permissions modified for role '{db_role.name}': {perm_names}",
    )

    return db_role


def get_dashboard_users(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
) -> Tuple[List[models.User], int]:
    query = db.query(models.User)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.User.first_name.ilike(search_filter),  # type: ignore
                models.User.last_name.ilike(search_filter),  # type: ignore
                models.User.email.ilike(search_filter),  # type: ignore
                models.User.employee_id.ilike(search_filter),  # type: ignore
            )
        )

    if status:
        query = query.filter(models.User.status == status)

    if role:
        query = query.join(models.User.roles).filter(models.Role.name == role)

    total = query.count()
    users = query.offset(skip).limit(limit).all()
    return users, total


def get_dashboard_roles(
    db: Session, skip: int = 0, limit: int = 20
) -> Tuple[List[models.Role], int]:
    query = db.query(models.Role)
    total = query.count()
    roles = query.offset(skip).limit(limit).all()
    return roles, total


def get_audit_logs(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    action_type: Optional[str] = None,
    actor_id: Optional[str] = None,
) -> Tuple[List[models.AuditLog], int]:
    query = db.query(models.AuditLog)

    if action_type:
        query = query.filter(models.AuditLog.action_type == action_type)

    if actor_id:
        query = query.filter(models.AuditLog.actor_id == actor_id)

    query = query.order_by(models.AuditLog.timestamp.desc())
    total = query.count()
    logs = query.offset(skip).limit(limit).all()
    return logs, total
