from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Assessment, EmissionResult, EmissionHotspot, Recommendation, User
from app.schemas.schemas import ApiResponse, EmissionResultOut, HotspotOut, RecommendationOut
from app.core.roles import UserRole, AuditEvent
from app.api.deps import get_current_user, require_roles, verify_assessment_access
from app.services.carbon_calculator import CarbonCalculationEngine
from app.services.hotspot_detector import HotspotDetectionEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.circularity_score import CircularityScoringEngine
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.post("/assessments/{assessment_id}/calculate", response_model=ApiResponse)
def run_carbon_analysis(
    assessment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.SUSTAINABILITY_CONSULTANT, UserRole.ADMIN))
):
    # Enforce write access (Regulator cannot trigger write calculations)
    assessment = verify_assessment_access(db, current_user, assessment_id, read_only=False)

    calc_engine = CarbonCalculationEngine(db)
    hotspot_engine = HotspotDetectionEngine(db)
    rec_engine = RecommendationEngine(db)
    circ_engine = CircularityScoringEngine(db)

    calc_res = calc_engine.calculate_assessment(assessment_id)
    hotspots = hotspot_engine.detect_and_rank_hotspots(assessment_id)
    recs = rec_engine.generate_recommendations(assessment_id)
    circ_res = circ_engine.calculate_circularity_score(assessment_id)

    db.refresh(assessment)

    log_audit_event(
        db, action=AuditEvent.CALCULATION_RUN, entity_type="ASSESSMENT",
        user=current_user, entity_id=assessment_id, factory_id=assessment.industry_id,
        details={"total_emissions_tco2e": assessment.total_emissions_tco2e, "hotspots": len(hotspots)},
        request=request
    )
    log_audit_event(
        db, action=AuditEvent.RECOMMENDATION_GENERATED, entity_type="RECOMMENDATIONS",
        user=current_user, entity_id=assessment_id, factory_id=assessment.industry_id,
        details={"recommendation_count": len(recs)},
        request=request
    )

    return ApiResponse(
        success=True,
        message="AI Carbon analysis and circular recommendation pipeline completed",
        data={
            "assessment_id": assessment_id,
            "total_emissions_tco2e": assessment.total_emissions_tco2e,
            "scope1_tco2e": assessment.scope1_tco2e,
            "scope2_tco2e": assessment.scope2_tco2e,
            "scope3_tco2e": assessment.scope3_tco2e,
            "emission_intensity": assessment.emission_intensity,
            "circularity_score": assessment.circularity_score,
            "hotspot_count": len(hotspots),
            "recommendation_count": len(recs)
        }
    )

@router.get("/assessments/{assessment_id}/emissions", response_model=ApiResponse)
def get_emissions(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = verify_assessment_access(db, current_user, assessment_id, read_only=True)
    results = db.query(EmissionResult).filter(EmissionResult.assessment_id == assessment_id).all()

    return ApiResponse(
        success=True,
        data={
            "assessment_id": assessment_id,
            "total_emissions_tco2e": assessment.total_emissions_tco2e,
            "scope1_tco2e": assessment.scope1_tco2e,
            "scope2_tco2e": assessment.scope2_tco2e,
            "scope3_tco2e": assessment.scope3_tco2e,
            "results": [EmissionResultOut.from_orm(r).dict() for r in results]
        }
    )

@router.get("/assessments/{assessment_id}/hotspots", response_model=ApiResponse)
def get_hotspots(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_assessment_access(db, current_user, assessment_id, read_only=True)
    hotspots = db.query(EmissionHotspot).filter(EmissionHotspot.assessment_id == assessment_id).order_by(EmissionHotspot.percentage_contribution.desc()).all()
    return ApiResponse(
        success=True,
        data=[HotspotOut.from_orm(h).dict() for h in hotspots]
    )

@router.get("/assessments/{assessment_id}/recommendations", response_model=ApiResponse)
def get_recommendations(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_assessment_access(db, current_user, assessment_id, read_only=True)
    recs = db.query(Recommendation).filter(Recommendation.assessment_id == assessment_id).order_by(Recommendation.priority_rank.asc()).all()
    return ApiResponse(
        success=True,
        data=[RecommendationOut.from_orm(r).dict() for r in recs]
    )
