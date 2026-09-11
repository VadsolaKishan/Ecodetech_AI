from datetime import datetime
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from fastapi import Request
from app.models.models import AuditLog, User
from app.core.roles import AuditEvent
import json

def log_audit_event(
    db: Session,
    action: str,
    entity_type: str,
    user: Optional[User] = None,
    user_id: Optional[int] = None,
    role: Optional[str] = None,
    entity_id: Optional[int] = None,
    factory_id: Optional[int] = None,
    details: Optional[Any] = None,
    request: Optional[Request] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """
    Centralized audit logging helper recording security and operational events.
    """
    uid = user.id if user else user_id
    urole = user.role if user else role

    if request and not ip_address:
        ip_address = request.client.host if request.client else None

    detail_str = None
    if details is not None:
        if isinstance(details, (dict, list)):
            detail_str = json.dumps(details)
        else:
            detail_str = str(details)

    log_entry = AuditLog(
        user_id=uid,
        role=urole,
        action=str(action),
        entity_type=str(entity_type),
        entity_id=entity_id,
        factory_id=factory_id,
        ip_address=ip_address,
        details=detail_str,
        timestamp=datetime.utcnow()
    )
    db.add(log_entry)
    try:
        db.commit()
        db.refresh(log_entry)
    except Exception as e:
        db.rollback()
        # Fallback to avoid failing the main operational transaction
        print(f"Audit log writing failed: {e}")
    return log_entry
