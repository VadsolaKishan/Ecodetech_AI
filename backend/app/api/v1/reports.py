from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import ApiResponse
from app.api.deps import get_current_user
from app.services.report_generator import ReportService

router = APIRouter()

@router.get("/{assessment_id}", response_model=ApiResponse)
def get_report_details(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ReportService(db)
    try:
        data = service.get_report_data(assessment_id)
        return ApiResponse(success=True, data=data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{assessment_id}/pdf")
def download_report_pdf(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ReportService(db)
    try:
        pdf_bytes = service.generate_pdf(assessment_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=CarbonCopilot_Report_{assessment_id}.pdf"}
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
