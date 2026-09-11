from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.models import Industry, User, FactoryAssignment, Factory
from app.schemas.schemas import IndustryCreate, IndustryUpdate, IndustryOut, ApiResponse
from app.core.roles import UserRole, AuditEvent
from app.api.deps import get_current_user, require_roles, verify_factory_access
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.get("/profile", response_model=ApiResponse)
def get_industry_profile(
    factory_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = (current_user.role or "").lower()
    industry = None

    if factory_id:
        industry = verify_factory_access(db, current_user, factory_id, read_only=True)
    elif user_role == UserRole.SUSTAINABILITY_CONSULTANT:
        assignment = db.query(FactoryAssignment).filter(
            FactoryAssignment.user_id == current_user.id,
            FactoryAssignment.role == "sustainability_consultant"
        ).first()
        if assignment:
            industry = assignment.industry or (db.query(Industry).filter(Industry.id == assignment.factory_id).first() if assignment.factory_id else None)
    elif user_role == UserRole.REGULATOR_AUDITOR:
        auth = db.query(FactoryAssignment).filter(
            FactoryAssignment.user_id == current_user.id,
            FactoryAssignment.role == "regulator_auditor"
        ).first()
        if auth:
            industry = auth.industry or (db.query(Industry).filter(Industry.id == auth.factory_id).first() if auth.factory_id else None)
        else:
            industry = db.query(Industry).first()
    else:
        # FACTORY_OWNER or ADMIN
        if current_user.industry_id:
            industry = db.query(Industry).filter(Industry.id == current_user.industry_id).first()
        if not industry:
            industry = db.query(Industry).filter(Industry.user_id == current_user.id).first()

    if not industry:
        return ApiResponse(
            success=True,
            message="No factory profile found",
            data=None
        )

    return ApiResponse(
        success=True,
        data=IndustryOut.from_orm(industry).dict()
    )

@router.put("/profile", response_model=ApiResponse)
def update_industry_profile(
    profile_in: IndustryUpdate,
    request: Request,
    factory_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.ADMIN))
):
    # Only Factory Owner and Admin can edit factory profiles (Consultant & Regulator are read-only)
    if factory_id:
        industry = verify_factory_access(db, current_user, factory_id, read_only=False)
    else:
        industry = db.query(Industry).filter(Industry.user_id == current_user.id).first()
        if not industry and current_user.industry_id:
            industry = db.query(Industry).filter(Industry.id == current_user.industry_id).first()

    if not industry:
        # Create new factory profile from submitted user inputs
        industry = Industry(
            user_id=current_user.id,
            company_name=profile_in.company_name or "My Industrial Facility",
            industry_type=profile_in.industry_type or "Manufacturing",
            factory_location=profile_in.factory_location or "Industrial Zone",
            production_type=profile_in.production_type or "Batch",
            monthly_production=profile_in.monthly_production or 0.0,
            production_unit=profile_in.production_unit or "tonnes",
            number_of_employees=profile_in.number_of_employees or 10,
            operating_hours_per_day=profile_in.operating_hours_per_day or 8.0,
            main_energy_sources=profile_in.main_energy_sources or "",
            main_raw_materials=profile_in.main_raw_materials or "",
            main_waste_types=profile_in.main_waste_types or ""
        )
        db.add(industry)
        db.commit()
        db.refresh(industry)
        current_user.industry_id = industry.id
        db.commit()

    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(industry, field, value)

    db.commit()
    db.refresh(industry)

    # Automatically keep factories table in sync with industry profile
    factory = db.query(Factory).filter(Factory.industry_id == industry.id).first()
    if not factory:
        factory = Factory(
            industry_id=industry.id,
            owner_id=industry.user_id or current_user.id,
            name=industry.company_name,
            location=industry.factory_location,
            sector=industry.industry_type
        )
        db.add(factory)
        db.commit()
        db.refresh(factory)
    else:
        factory.name = industry.company_name
        factory.location = industry.factory_location
        factory.sector = industry.industry_type
        db.commit()

    if not current_user.factory_id:
        current_user.factory_id = factory.id
        db.commit()

    log_audit_event(
        db, action="FACTORY_PROFILE_UPDATED", entity_type="INDUSTRY",
        user=current_user, entity_id=industry.id, factory_id=industry.id,
        details={"company_name": industry.company_name},
        request=request
    )

    return ApiResponse(
        success=True,
        message="Industrial profile updated successfully",
        data=IndustryOut.from_orm(industry).dict()
    )
