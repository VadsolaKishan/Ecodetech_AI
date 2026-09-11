from typing import List, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import decode_access_token
from app.core.roles import UserRole
from app.models.models import (
    User, Industry, Assessment, FactoryAssignment
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    effective_token = token or request.query_params.get("token")
    if not effective_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = decode_access_token(effective_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been disabled by an administrator",
        )

    return user

def require_roles(*allowed_roles: str):
    """
    FastAPI dependency to enforce role requirements.
    Raises HTTP 403 if the user does not hold one of the required roles.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or "").lower()
        allowed = [str(r.value if hasattr(r, 'value') else r).lower() for r in allowed_roles]
        if user_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{current_user.role}' is not authorized for this resource"
            )
        return current_user
    return role_checker

def verify_factory_access(
    db: Session,
    user: User,
    factory_id: int,
    read_only: bool = False
) -> Industry:
    """
    Verifies that the given user has permission to access the factory (industry).
    Prevents IDOR attacks across all roles.
    """
    factory = db.query(Industry).filter(Industry.id == factory_id).first()
    if not factory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Factory not found"
        )

    user_role = (user.role or "").lower()

    # 1. ADMIN has global access
    if user_role == UserRole.ADMIN.value:
        return factory

    # 2. REGULATOR_AUDITOR has read-only access to authorized factories
    if user_role == UserRole.REGULATOR_AUDITOR.value:
        if not read_only:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Regulator / Auditor accounts have read-only inspection access and cannot modify data"
            )
        # Check if regulator has specific assigned factories
        has_assignments = db.query(FactoryAssignment).filter(
            FactoryAssignment.user_id == user.id,
            FactoryAssignment.role == "regulator_auditor"
        ).first()
        if has_assignments:
            is_authorized = db.query(FactoryAssignment).filter(
                FactoryAssignment.user_id == user.id,
                FactoryAssignment.role == "regulator_auditor",
                (FactoryAssignment.industry_id == factory_id) | (FactoryAssignment.factory_id == factory_id)
            ).first()
            if not is_authorized:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Factory is not within your authorized audit jurisdiction"
                )
        return factory

    # 3. SUSTAINABILITY_CONSULTANT: only factories explicitly assigned
    if user_role == UserRole.SUSTAINABILITY_CONSULTANT.value:
        assignment = db.query(FactoryAssignment).filter(
            FactoryAssignment.user_id == user.id,
            FactoryAssignment.role == "sustainability_consultant",
            (FactoryAssignment.industry_id == factory_id) | (FactoryAssignment.factory_id == factory_id)
        ).first()
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not assigned as a consultant for this factory"
            )
        return factory

    # 4. FACTORY_OWNER: only own factory
    is_owner = (factory.user_id == user.id) or (user.industry_id == factory_id)
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not own or manage this factory"
        )

    return factory

def verify_assessment_access(
    db: Session,
    user: User,
    assessment_id: int,
    read_only: bool = False
) -> Assessment:
    """
    Verifies that the given user has permission to access the assessment
    via factory ownership or assignment. Prevents IDOR.
    """
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    # Verify access to the parent factory
    verify_factory_access(db, user, assessment.industry_id, read_only=read_only)
    return assessment

def resolve_accessible_assessment(
    db: Session,
    user: User,
    assessment_id: Optional[int] = None,
    read_only: bool = True
) -> Optional[Assessment]:
    """
    Attempts to verify access to requested assessment_id.
    If requested ID is missing, invalid, or belongs to another user,
    seamlessly resolves the latest assessment accessible to the current user.
    Returns None if the user has no assessments.
    """
    if assessment_id and assessment_id > 0:
        try:
            return verify_assessment_access(db, user, assessment_id, read_only=read_only)
        except HTTPException:
            pass

    user_role = (user.role or "").lower()
    if user_role == UserRole.ADMIN.value:
        return db.query(Assessment).order_by(Assessment.created_at.desc()).first()

    if user_role == UserRole.SUSTAINABILITY_CONSULTANT.value:
        assignments = db.query(FactoryAssignment).filter(
            FactoryAssignment.user_id == user.id,
            FactoryAssignment.role == "sustainability_consultant"
        ).all()
        factory_ids = [a.industry_id or a.factory_id for a in assignments if (a.industry_id or a.factory_id)]
        return db.query(Assessment).filter(Assessment.industry_id.in_(factory_ids)).order_by(Assessment.created_at.desc()).first()

    if user_role == UserRole.REGULATOR_AUDITOR.value:
        authorizations = db.query(FactoryAssignment).filter(
            FactoryAssignment.user_id == user.id,
            FactoryAssignment.role == "regulator_auditor"
        ).all()
        if authorizations:
            auth_ids = [a.industry_id or a.factory_id for a in authorizations if (a.industry_id or a.factory_id)]
            return db.query(Assessment).filter(Assessment.industry_id.in_(auth_ids)).order_by(Assessment.created_at.desc()).first()
        return db.query(Assessment).order_by(Assessment.created_at.desc()).first()

    # FACTORY_OWNER
    owned_industries = db.query(Industry).filter(Industry.user_id == user.id).all()
    owned_ids = [i.id for i in owned_industries]
    if user.industry_id and user.industry_id not in owned_ids:
        owned_ids.append(user.industry_id)
    return db.query(Assessment).filter(
        Assessment.industry_id.in_(owned_ids) if owned_ids else Assessment.user_id == user.id
    ).order_by(Assessment.created_at.desc()).first()
