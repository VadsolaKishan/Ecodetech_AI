from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import ApiResponse
from app.core.roles import UserRole, AuditEvent
from app.api.deps import get_current_user, require_roles, verify_assessment_access, resolve_accessible_assessment
from app.services.report_generator import ReportService
from app.services.audit_service import log_audit_event
from app.core.cache import api_cache

router = APIRouter()

@router.get("/{assessment_id}", response_model=ApiResponse)
def get_report_details(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = resolve_accessible_assessment(db, current_user, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="No assessment report available for this facility")

    actual_id = assessment.id
    cache_key = f"report_data_{actual_id}"
    cached = api_cache.get(cache_key)
    if cached:
        return ApiResponse(success=True, data=cached)

    service = ReportService(db)
    try:
        data = service.get_report_data(actual_id)
        api_cache.set(cache_key, data, ttl=120, tags=[f"assessment_{actual_id}"])
        return ApiResponse(success=True, data=data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{assessment_id}/pdf")
def download_report_pdf(
    assessment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = resolve_accessible_assessment(db, current_user, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="No assessment report available to download")

    service = ReportService(db)
    try:
        pdf_bytes = service.generate_pdf(assessment.id)
        log_audit_event(
            db, action=AuditEvent.REPORT_GENERATED, entity_type="REPORT_PDF",
            user=current_user, entity_id=assessment.id, factory_id=assessment.industry_id,
            details={"format": "PDF"},
            request=request
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=EcoDetect_Report_{assessment_id}.pdf"}
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{assessment_id}/generate", response_model=ApiResponse)
def generate_report(
    assessment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.SUSTAINABILITY_CONSULTANT, UserRole.ADMIN))
):
    # Generation action: restricted to Factory Owner, Consultant, Admin
    assessment = verify_assessment_access(db, current_user, assessment_id, read_only=False)
    service = ReportService(db)
    data = service.get_report_data(assessment_id)

    log_audit_event(
        db, action=AuditEvent.REPORT_GENERATED, entity_type="REPORT",
        user=current_user, entity_id=assessment_id, factory_id=assessment.industry_id,
        details={"total_emissions": assessment.total_emissions_tco2e},
        request=request
    )

    return ApiResponse(
        success=True,
        message="Sustainability Report generated successfully",
        data=data
    )
