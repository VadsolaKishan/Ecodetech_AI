from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database.session import get_db
from app.models.models import (
    User, Industry, EmissionFactor, RecommendationKnowledge,
    AuditLog, FactoryAssignment
)
from app.core.roles import UserRole, AuditEvent
from app.core.security import get_password_hash
from app.api.deps import get_current_user, require_roles
from app.services.audit_service import log_audit_event

router = APIRouter()

# Schema models for admin operations
class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    industry_id: Optional[int] = None

class AdminRoleUpdate(BaseModel):
    role: str

class AdminStatusUpdate(BaseModel):
    is_active: bool

class ConsultantAssignRequest(BaseModel):
    consultant_id: int
    industry_id: int

class EmissionFactorCreate(BaseModel):
    category: str
    activity: str
    unit: str
    factor: float
    factor_unit: str
    source: Optional[str] = "IPCC / CEA India"
    region: Optional[str] = "India"
    year: Optional[int] = 2024
    confidence_level: Optional[str] = "High"
    version: Optional[str] = "1.0"

class RecommendationKnowledgeCreate(BaseModel):
    key: str
    title: str
    category: str
    target_source: str
    reduction_min_pct: float
    reduction_max_pct: float
    cost_multiplier_inr_per_kw: float
    savings_rate_per_kwh: float
    feasibility: str = "High"
    base_payback_months: int = 24
    circularity_boost: float = 15.0
    reason_template: str
    version: str = "1.0"
    is_active: bool = True

# ==================== 1. USER MANAGEMENT (ADMIN ONLY) ====================

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    users = db.query(User).order_by(User.id.asc()).all()
    data = []
    for u in users:
        data.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "industry_id": u.industry_id,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    return {"success": True, "data": data}

@router.get("/consultants")
def list_consultants(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    consultants = db.query(User).filter(
        (User.role == "sustainability_consultant") | (User.role == "SUSTAINABILITY_CONSULTANT")
    ).filter(User.is_active == True).all()
    return {
        "success": True,
        "data": [
            {"id": c.id, "full_name": c.full_name, "email": c.email, "role": c.role}
            for c in consultants
        ]
    }

@router.post("/users")
def create_user(
    req: AdminUserCreate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    valid_roles = [r.value for r in UserRole]
    target_role = req.role.lower().strip()
    if target_role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}")

    new_user = User(
        email=req.email,
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        role=target_role,
        industry_id=req.industry_id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_audit_event(
        db, action="USER_CREATED", entity_type="USER",
        user=admin, entity_id=new_user.id,
        details={"created_email": new_user.email, "role": new_user.role},
        request=request
    )

    return {"success": True, "message": "User created successfully", "data": {"id": new_user.id, "email": new_user.email, "role": new_user.role}}

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    req: AdminRoleUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    valid_roles = [r.value for r in UserRole]
    new_role = req.role.lower().strip()
    if new_role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Safeguard: prevent removing the last admin
    if target_user.role == UserRole.ADMIN.value and new_role != UserRole.ADMIN.value:
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN.value, User.is_active == True).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot change role of the sole active administrator")

    old_role = target_user.role
    target_user.role = new_role
    db.commit()

    log_audit_event(
        db, action=AuditEvent.USER_ROLE_CHANGED, entity_type="USER",
        user=admin, entity_id=target_user.id,
        details={"previous_role": old_role, "new_role": target_user.role},
        request=request
    )

    return {"success": True, "message": f"User role updated to {target_user.role}"}

@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    req: AdminStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.is_active = req.is_active
    db.commit()

    action = "USER_ENABLED" if req.is_active else "USER_DISABLED"
    log_audit_event(
        db, action=action, entity_type="USER",
        user=admin, entity_id=target_user.id,
        details={"is_active": target_user.is_active},
        request=request
    )

    return {"success": True, "message": f"User status set to active={req.is_active}"}

# ==================== 2. FACTORIES & CONSULTANT ASSIGNMENTS ====================

@router.get("/industries")
def list_all_industries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.REGULATOR_AUDITOR, UserRole.SUSTAINABILITY_CONSULTANT))
):
    user_role = (current_user.role or "").lower()
    if user_role == UserRole.ADMIN:
        factories = db.query(Industry).all()
    elif user_role == UserRole.SUSTAINABILITY_CONSULTANT:
        # Assigned factories
        assignments = db.query(FactoryAssignment).filter(
            FactoryAssignment.user_id == current_user.id,
            FactoryAssignment.role == "sustainability_consultant"
        ).all()
        assigned_ids = [a.industry_id or a.factory_id for a in assignments if (a.industry_id or a.factory_id)]
        factories = db.query(Industry).filter(Industry.id.in_(assigned_ids)).all() if assigned_ids else []
    else:
        # Regulator
        factories = db.query(Industry).all()

    data = []
    for f in factories:
        consultants = db.query(FactoryAssignment).filter(
            FactoryAssignment.industry_id == f.id,
            FactoryAssignment.role == "sustainability_consultant"
        ).all()
        consultant_users = [c.user.full_name for c in consultants if c.user]
        data.append({
            "id": f.id,
            "company_name": f.company_name,
            "industry_type": f.industry_type,
            "factory_location": f.factory_location,
            "monthly_production": f.monthly_production,
            "production_unit": f.production_unit,
            "assigned_consultants": consultant_users,
            "created_at": f.created_at.isoformat() if f.created_at else None
        })
    return {"success": True, "data": data}

@router.post("/industries/assign-consultant")
def assign_consultant(
    req: ConsultantAssignRequest,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    consultant = db.query(User).filter(User.id == req.consultant_id).first()
    if not consultant or (consultant.role or "").lower() != "sustainability_consultant":
        raise HTTPException(status_code=400, detail="User must have the SUSTAINABILITY_CONSULTANT role")

    factory = db.query(Industry).filter(Industry.id == req.industry_id).first()
    if not factory:
        raise HTTPException(status_code=404, detail="Factory not found")

    existing = db.query(FactoryAssignment).filter(
        FactoryAssignment.user_id == req.consultant_id,
        FactoryAssignment.industry_id == req.industry_id,
        FactoryAssignment.role == "sustainability_consultant"
    ).first()
    if not existing:
        assign = FactoryAssignment(
            user_id=req.consultant_id,
            industry_id=req.industry_id,
            role="sustainability_consultant",
            assigned_by=admin.id
        )
        db.add(assign)
        db.commit()

    log_audit_event(
        db, action="CONSULTANT_ASSIGNED", entity_type="INDUSTRY",
        user=admin, entity_id=req.industry_id, factory_id=req.industry_id,
        details={"consultant_id": req.consultant_id, "consultant_name": consultant.full_name},
        request=request
    )

    return {"success": True, "message": f"Consultant {consultant.full_name} assigned to {factory.company_name}"}

# ==================== 3. EMISSION FACTORS ====================

@router.get("/emission-factors")
def list_emission_factors(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.REGULATOR_AUDITOR))
):
    factors = db.query(EmissionFactor).order_by(EmissionFactor.category.asc(), EmissionFactor.activity.asc()).all()
    return {"success": True, "data": factors}

@router.post("/emission-factors")
def create_emission_factor(
    req: EmissionFactorCreate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    existing = db.query(EmissionFactor).filter(EmissionFactor.activity == req.activity).first()
    if existing:
        raise HTTPException(status_code=400, detail="An emission factor for this activity already exists")

    new_ef = EmissionFactor(
        category=req.category,
        activity=req.activity,
        unit=req.unit,
        factor=req.factor,
        factor_unit=req.factor_unit,
        source=req.source,
        region=req.region,
        year=req.year,
        confidence_level=req.confidence_level,
        version=req.version,
        is_active=True
    )
    db.add(new_ef)
    db.commit()
    db.refresh(new_ef)

    log_audit_event(
        db, action=AuditEvent.EMISSION_FACTOR_CHANGED, entity_type="EMISSION_FACTOR",
        user=admin, entity_id=new_ef.id,
        details={"activity": new_ef.activity, "factor": new_ef.factor, "unit": new_ef.factor_unit, "action": "CREATE"},
        request=request
    )

    return {"success": True, "data": new_ef}

@router.put("/emission-factors/{factor_id}")
def update_emission_factor(
    factor_id: int,
    req: EmissionFactorCreate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    ef = db.query(EmissionFactor).filter(EmissionFactor.id == factor_id).first()
    if not ef:
        raise HTTPException(status_code=404, detail="Emission factor not found")

    old_val = ef.factor
    ef.factor = req.factor
    ef.unit = req.unit
    ef.factor_unit = req.factor_unit
    ef.source = req.source
    ef.confidence_level = req.confidence_level
    ef.version = req.version
    db.commit()

    log_audit_event(
        db, action=AuditEvent.EMISSION_FACTOR_CHANGED, entity_type="EMISSION_FACTOR",
        user=admin, entity_id=ef.id,
        details={"activity": ef.activity, "old_factor": old_val, "new_factor": ef.factor, "action": "UPDATE"},
        request=request
    )

    return {"success": True, "data": ef}

# ==================== 4. RECOMMENDATION KNOWLEDGE BASE ====================

@router.get("/recommendation-knowledge")
def list_recommendation_knowledge(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.REGULATOR_AUDITOR))
):
    rules = db.query(RecommendationKnowledge).order_by(RecommendationKnowledge.id.asc()).all()
    return {"success": True, "data": rules}

@router.post("/recommendation-knowledge")
def create_recommendation_knowledge(
    req: RecommendationKnowledgeCreate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN))
):
    existing = db.query(RecommendationKnowledge).filter(RecommendationKnowledge.key == req.key).first()
    if existing:
        raise HTTPException(status_code=400, detail="A knowledge item with this key already exists")

    rule = RecommendationKnowledge(**req.dict())
    db.add(rule)
    db.commit()
    db.refresh(rule)

    log_audit_event(
        db, action="KNOWLEDGE_BASE_RULE_CREATED", entity_type="RECOMMENDATION_KNOWLEDGE",
        user=admin, entity_id=rule.id,
        details={"key": rule.key, "title": rule.title},
        request=request
    )
    return {"success": True, "data": rule}

# ==================== 5. AUDIT LOGS (ADMIN & REGULATOR) ====================

@router.get("/audit-logs")
def list_audit_logs(
    action: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.REGULATOR_AUDITOR))
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

    data = []
    for l in logs:
        data.append({
            "id": l.id,
            "user_id": l.user_id,
            "user_email": l.user.email if l.user else "System",
            "role": l.role,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "factory_id": l.factory_id,
            "ip_address": l.ip_address,
            "details": l.details,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        })
    return {"success": True, "data": data}
