from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.models import (
    Assessment, Industry, EmissionResult, EmissionHotspot, Recommendation, User,
    FactoryAssignment
)
from app.schemas.schemas import ApiResponse
from app.core.roles import UserRole
from app.api.deps import get_current_user, verify_assessment_access

router = APIRouter()

@router.get("/summary", response_model=ApiResponse)
def get_dashboard_summary(
    assessment_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = (current_user.role or "").lower()
    assessment = None

    if assessment_id:
        assessment = verify_assessment_access(db, current_user, assessment_id, read_only=True)
    else:
        # Resolve appropriate default assessment based on role
        if user_role == UserRole.ADMIN:
            assessment = db.query(Assessment).order_by(Assessment.created_at.desc()).first()
        elif user_role == UserRole.SUSTAINABILITY_CONSULTANT:
            assignments = db.query(FactoryAssignment).filter(
                FactoryAssignment.user_id == current_user.id,
                FactoryAssignment.role == "sustainability_consultant"
            ).all()
            factory_ids = [a.industry_id or a.factory_id for a in assignments if (a.industry_id or a.factory_id)]
            assessment = db.query(Assessment).filter(Assessment.industry_id.in_(factory_ids)).order_by(Assessment.created_at.desc()).first()
        elif user_role == UserRole.REGULATOR_AUDITOR:
            authorizations = db.query(FactoryAssignment).filter(
                FactoryAssignment.user_id == current_user.id,
                FactoryAssignment.role == "regulator_auditor"
            ).all()
            if authorizations:
                auth_ids = [a.industry_id or a.factory_id for a in authorizations if (a.industry_id or a.factory_id)]
                assessment = db.query(Assessment).filter(Assessment.industry_id.in_(auth_ids)).order_by(Assessment.created_at.desc()).first()
            else:
                assessment = db.query(Assessment).order_by(Assessment.created_at.desc()).first()
        else:
            # FACTORY_OWNER
            owned_industries = db.query(Industry).filter(Industry.user_id == current_user.id).all()
            owned_ids = [i.id for i in owned_industries]
            if current_user.industry_id and current_user.industry_id not in owned_ids:
                owned_ids.append(current_user.industry_id)
            assessment = db.query(Assessment).filter(Assessment.industry_id.in_(owned_ids) if owned_ids else Assessment.user_id == current_user.id).order_by(Assessment.created_at.desc()).first()

    if not assessment:
        return ApiResponse(
            success=True,
            data={
                "has_assessment": False,
                "headline": "Welcome to CarbonCopilot AI. Create your factory profile and start an assessment to begin.",
                "kpis": {}
            }
        )

    industry = assessment.industry
    hotspots = db.query(EmissionHotspot).filter(EmissionHotspot.assessment_id == assessment.id).order_by(EmissionHotspot.percentage_contribution.desc()).all()
    recommendations = db.query(Recommendation).filter(Recommendation.assessment_id == assessment.id).order_by(Recommendation.priority_rank.asc()).all()
    results = db.query(EmissionResult).filter(EmissionResult.assessment_id == assessment.id).all()

    top_hotspot = hotspots[0] if hotspots else None
    top_opportunity = recommendations[0] if recommendations else None

    # Calculate overall potential reduction %
    total_t = assessment.total_emissions_tco2e
    red_t = assessment.potential_reduction_tco2e
    red_pct = round((red_t / total_t) * 100.0, 1) if total_t > 0 else 0.0

    summary_data = {
        "has_assessment": True,
        "assessment_id": assessment.id,
        "assessment_name": assessment.name,
        "factory_name": industry.company_name if industry else "Factory Unit",
        "industry_type": industry.industry_type if industry else "Manufacturing",
        "location": industry.factory_location if industry else "India",
        "headline": f"Good morning. Here's {industry.company_name if industry else 'your factory'}'s carbon intelligence.",
        "kpis": {
            "total_emissions_tco2e": assessment.total_emissions_tco2e,
            "potential_reduction_pct": red_pct,
            "top_hotspot": top_hotspot.source_name if top_hotspot else "Pending Calculation",
            "top_hotspot_pct": top_hotspot.percentage_contribution if top_hotspot else 0.0,
            "top_opportunity": top_opportunity.title if top_opportunity else "Pending Optimization",
            "circularity_score": assessment.circularity_score,
            "annual_savings_inr": assessment.potential_savings_inr
        },
        "scope_breakdown": {
            "scope1": assessment.scope1_tco2e,
            "scope2": assessment.scope2_tco2e,
            "scope3": assessment.scope3_tco2e,
        },
        "hotspots_count": len(hotspots),
        "recommendations_count": len(recommendations)
    }

    return ApiResponse(success=True, data=summary_data)
