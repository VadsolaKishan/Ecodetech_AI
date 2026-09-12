from fastapi import APIRouter, Depends, HTTPException, status, Request, File, UploadFile, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.models import (
    Assessment, Industry, EnergyInput, MaterialInput, WasteInput, TransportInput, User,
    FactoryAssignment, Factory
)
from app.schemas.schemas import (
    AssessmentCreate, AssessmentOut, AssessmentFullDetail, ApiResponse,
    BillOcrSampleRequest, BillOcrResult
)
from app.core.roles import UserRole, AuditEvent
from app.api.deps import (
    get_current_user, require_roles,
    verify_assessment_access, verify_factory_access
)
from app.services.carbon_calculator import CarbonCalculationEngine
from app.services.hotspot_detector import HotspotDetectionEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.circularity_score import CircularityScoringEngine
from app.services.audit_service import log_audit_event
from app.services.ocr_service import BillOcrService

router = APIRouter()

@router.get("", response_model=ApiResponse)
def list_assessments(
    factory_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = (current_user.role or "").lower()
    query = db.query(Assessment)

    if user_role == UserRole.ADMIN:
        # Admin can view all assessments
        pass
    elif user_role == UserRole.SUSTAINABILITY_CONSULTANT:
        # Assigned factories only
        assignments = db.query(FactoryAssignment).filter(
            FactoryAssignment.user_id == current_user.id,
            FactoryAssignment.role == "sustainability_consultant"
        ).all()
        assigned_factory_ids = [a.industry_id or a.factory_id for a in assignments if (a.industry_id or a.factory_id)]
        query = query.filter(Assessment.industry_id.in_(assigned_factory_ids))
    elif user_role == UserRole.REGULATOR_AUDITOR:
        # Authorized factories or all in read-only
        authorizations = db.query(FactoryAssignment).filter(
            FactoryAssignment.user_id == current_user.id,
            FactoryAssignment.role == "regulator_auditor"
        ).all()
        if authorizations:
            auth_ids = [a.industry_id or a.factory_id for a in authorizations if (a.industry_id or a.factory_id)]
            query = query.filter(Assessment.industry_id.in_(auth_ids))
    else:
        # FACTORY_OWNER: own factory assessments
        owned_industries = db.query(Industry).filter(Industry.user_id == current_user.id).all()
        owned_ids = [i.id for i in owned_industries]
        if current_user.industry_id and current_user.industry_id not in owned_ids:
            owned_ids.append(current_user.industry_id)
        query = query.filter(Assessment.industry_id.in_(owned_ids) if owned_ids else Assessment.user_id == current_user.id)

    # Apply specific factory filter if requested
    if factory_id:
        target_ind = db.query(Industry).filter(Industry.id == factory_id).first()
        if target_ind:
            fac_ids = [f.id for f in db.query(Factory).filter(Factory.industry_id == target_ind.id).all()]
            query = query.filter(
                (Assessment.industry_id == target_ind.id) | (Assessment.factory_id.in_(fac_ids))
            )
        else:
            target_fac = db.query(Factory).filter(Factory.id == factory_id).first()
            if target_fac:
                query = query.filter(
                    (Assessment.factory_id == target_fac.id) | (Assessment.industry_id == target_fac.industry_id)
                )
            else:
                query = query.filter(
                    (Assessment.industry_id == factory_id) | (Assessment.factory_id == factory_id)
                )

    assessments = query.order_by(Assessment.created_at.desc()).all()
    results = [AssessmentOut.from_orm(a).dict() for a in assessments]
    return ApiResponse(success=True, data=results)

@router.post("", response_model=ApiResponse)
def create_assessment(
    data: AssessmentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.SUSTAINABILITY_CONSULTANT, UserRole.ADMIN))
):
    user_role = (current_user.role or "").lower()
    
    # Resolve target industry
    industry = None

    if data.industry_id:
        # If explicitly targeting a specific factory
        target_ind = db.query(Industry).filter(Industry.id == data.industry_id).first()
        if target_ind:
            industry = target_ind

    if not industry:
        if user_role == UserRole.SUSTAINABILITY_CONSULTANT:
            # Consultant must specify or have an assigned factory
            assignment = db.query(FactoryAssignment).filter(
                FactoryAssignment.user_id == current_user.id,
                FactoryAssignment.role == "sustainability_consultant"
            ).first()
            if not assignment:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You have not been assigned to any factory to create assessments"
                )
            industry = assignment.industry or (db.query(Industry).filter(Industry.id == assignment.factory_id).first() if assignment.factory_id else None)
            if not industry:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assigned factory could not be found"
                )
        else:
            # Factory owner or Admin
            if current_user.industry_id:
                industry = db.query(Industry).filter(Industry.id == current_user.industry_id).first()
            if not industry:
                industry = db.query(Industry).filter(Industry.user_id == current_user.id).first()
            if not industry:
                industry = Industry(
                    user_id=current_user.id,
                    company_name=f"{current_user.full_name}'s Plant",
                    industry_type="Manufacturing",
                    factory_location="Industrial Park"
                )
                db.add(industry)
                db.commit()
                db.refresh(industry)
                current_user.industry_id = industry.id
                db.commit()

    if data.monthly_production:
        industry.monthly_production = data.monthly_production
    if data.production_unit:
        industry.production_unit = data.production_unit
    db.commit()

    # Ensure Factory exists and is linked
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

    if not current_user.factory_id:
        current_user.factory_id = factory.id
        db.commit()

    assessment = Assessment(
        user_id=current_user.id,
        industry_id=industry.id,
        factory_id=factory.id,
        name=data.name or "Factory Carbon Audit",
        assessment_period=data.assessment_period or "Monthly 2026",
        status="draft"
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Populate inputs
    for e in data.energy_inputs:
        db.add(EnergyInput(
            assessment_id=assessment.id,
            source_type=e.source_type,
            quantity=e.quantity,
            unit=e.unit,
            renewable_percentage=e.renewable_percentage,
            notes=e.notes
        ))

    for m in data.material_inputs:
        db.add(MaterialInput(
            assessment_id=assessment.id,
            material_name=m.material_name,
            material_type=m.material_type,
            quantity=m.quantity,
            unit=m.unit,
            virgin_percentage=m.virgin_percentage,
            recycled_percentage=m.recycled_percentage,
            notes=getattr(m, 'notes', None)
        ))

    for w in data.waste_inputs:
        db.add(WasteInput(
            assessment_id=assessment.id,
            waste_type=w.waste_type,
            quantity=w.quantity,
            unit=w.unit,
            disposal_method=w.disposal_method,
            recyclable_percentage=w.recyclable_percentage,
            notes=getattr(w, 'notes', None)
        ))

    for t in data.transport_inputs:
        db.add(TransportInput(
            assessment_id=assessment.id,
            transport_mode=t.transport_mode,
            distance_km=t.distance_km,
            weight_tonnes=t.weight_tonnes,
            frequency_per_month=t.frequency_per_month
        ))

    db.commit()

    # Trigger deterministic carbon calculations & anomaly hotspot ranking
    calc_engine = CarbonCalculationEngine(db)
    hotspot_engine = HotspotDetectionEngine(db)
    rec_engine = RecommendationEngine(db)
    circ_engine = CircularityScoringEngine(db)

    calc_engine.calculate_assessment(assessment.id)
    hotspot_engine.detect_and_rank_hotspots(assessment.id)
    rec_engine.generate_recommendations(assessment.id)
    circ_engine.calculate_circularity_score(assessment.id)

    db.refresh(assessment)

    log_audit_event(
        db, action=AuditEvent.ASSESSMENT_CREATED, entity_type="ASSESSMENT",
        user=current_user, entity_id=assessment.id, factory_id=assessment.industry_id,
        details={"name": assessment.name, "total_emissions": assessment.total_emissions_tco2e},
        request=request
    )

    return ApiResponse(
        success=True,
        message="Assessment created and AI carbon analysis completed",
        data=AssessmentOut.from_orm(assessment).dict()
    )

@router.get("/{assessment_id}", response_model=ApiResponse)
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforces factory access & IDOR prevention (read-only allowed for Regulator)
    assessment = verify_assessment_access(db, current_user, assessment_id, read_only=True)

    detail = AssessmentFullDetail.from_orm(assessment).dict()
    detail["energy_inputs"] = [{"source_type": e.source_type, "quantity": e.quantity, "unit": e.unit, "renewable_percentage": e.renewable_percentage} for e in assessment.energy_inputs]
    detail["material_inputs"] = [{"material_name": m.material_name, "material_type": m.material_type, "quantity": m.quantity, "unit": m.unit, "virgin_percentage": m.virgin_percentage, "recycled_percentage": m.recycled_percentage} for m in assessment.material_inputs]
    detail["waste_inputs"] = [{"waste_type": w.waste_type, "quantity": w.quantity, "unit": w.unit, "disposal_method": w.disposal_method, "recyclable_percentage": w.recyclable_percentage} for w in assessment.waste_inputs]
    detail["transport_inputs"] = [{"transport_mode": t.transport_mode, "distance_km": t.distance_km, "weight_tonnes": t.weight_tonnes, "frequency_per_month": t.frequency_per_month} for t in assessment.transport_inputs]

    return ApiResponse(success=True, data=detail)

@router.delete("/{assessment_id}", response_model=ApiResponse)
def delete_assessment(
    assessment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.ADMIN))
):
    # Enforce write access (Regulator cannot delete; Factory Owner can only delete own factory)
    assessment = verify_assessment_access(db, current_user, assessment_id, read_only=False)

    factory_id = assessment.industry_id
    db.delete(assessment)
    db.commit()

    log_audit_event(
        db, action=AuditEvent.ASSESSMENT_DELETED, entity_type="ASSESSMENT",
        user=current_user, entity_id=assessment_id, factory_id=factory_id,
        request=request
    )

    return ApiResponse(success=True, message="Assessment deleted successfully")

@router.post("/ocr-bill", response_model=ApiResponse)
async def scan_bill_ocr(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.SUSTAINABILITY_CONSULTANT, UserRole.ADMIN))
):
    try:
        content = await file.read()
        mime_type = file.content_type or "image/jpeg"
        service = BillOcrService()
        result = service.extract_from_file_bytes(content, mime_type=mime_type, filename=file.filename or "")
        return ApiResponse(success=True, message="Bill parsed successfully with Gemini Vision", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse bill: {str(e)}")

@router.post("/ocr-sample", response_model=ApiResponse)
def get_ocr_sample(
    payload: BillOcrSampleRequest,
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.SUSTAINABILITY_CONSULTANT, UserRole.ADMIN))
):
    service = BillOcrService()
    result = service.get_sample_preset(payload.sample_type)
    if not result:
        raise HTTPException(status_code=404, detail="Sample preset not found")
    return ApiResponse(success=True, message="Loaded sample bill preset", data=result)
