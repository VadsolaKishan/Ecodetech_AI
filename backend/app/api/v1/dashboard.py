from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.models import Assessment, Industry, EmissionResult, EmissionHotspot, Recommendation, User
from app.schemas.schemas import ApiResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/summary", response_model=ApiResponse)
def get_dashboard_summary(
    assessment_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if assessment_id:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    else:
        assessment = db.query(Assessment).filter(
            Assessment.user_id == current_user.id,
            Assessment.status == "calculated"
        ).order_by(Assessment.total_emissions_tco2e.desc()).first()
        if not assessment:
            assessment = db.query(Assessment).filter(Assessment.user_id == current_user.id).order_by(Assessment.created_at.desc()).first()

    if not assessment:
        return ApiResponse(
            success=True,
            data={
                "has_assessment": False,
                "headline": "Welcome to CarbonCopilot AI. Start an assessment or load a demo factory to begin.",
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
            "potential_reduction_tco2e": red_t,
            "carbon_intensity": assessment.emission_intensity,
            "production_unit": industry.production_unit if industry else "unit",
            "top_hotspot": top_hotspot.source_name if top_hotspot else "Pending Analysis",
            "top_hotspot_pct": top_hotspot.percentage_contribution if top_hotspot else 0.0,
            "top_hotspot_severity": top_hotspot.severity if top_hotspot else "Low",
            "best_opportunity": top_opportunity.title if top_opportunity else "Pending Analysis",
            "potential_annual_savings_inr": assessment.potential_savings_inr,
            "circularity_score": assessment.circularity_score,
            "confidence_level": assessment.confidence_level
        },
        "scopes": {
            "scope1_tco2e": assessment.scope1_tco2e,
            "scope2_tco2e": assessment.scope2_tco2e,
            "scope3_tco2e": assessment.scope3_tco2e
        },
        "category_breakdown": {
            "Energy": round(sum(r.emissions_kg_co2e for r in results if r.category == "Energy") / 1000.0, 2),
            "Materials": round(sum(r.emissions_kg_co2e for r in results if r.category == "Materials") / 1000.0, 2),
            "Waste": round(sum(r.emissions_kg_co2e for r in results if r.category == "Waste") / 1000.0, 2),
            "Transport": round(sum(r.emissions_kg_co2e for r in results if r.category == "Transport") / 1000.0, 2)
        },
        "top_hotspots": [
            {
                "id": h.id,
                "source_name": h.source_name,
                "category": h.category,
                "emissions_kg": h.emissions_kg_co2e,
                "percentage": h.percentage_contribution,
                "severity": h.severity,
                "hotspot_score": h.hotspot_score,
                "anomaly": h.anomaly_detected,
                "explanation": h.explanation
            }
            for h in hotspots[:4]
        ],
        "top_recommendations": [
            {
                "id": r.id,
                "title": r.title,
                "category": r.category,
                "target_source": r.target_emission_source,
                "reduction_pct": r.reduction_percentage,
                "co2_cut_kg": r.estimated_co2_reduction_kg,
                "cost_inr": r.implementation_cost_inr,
                "savings_inr": r.annual_savings_inr,
                "payback_months": r.payback_months,
                "feasibility": r.feasibility,
                "priority_rank": r.priority_rank,
                "reason": r.reason
            }
            for r in recommendations[:4]
        ]
    }
    return ApiResponse(success=True, data=summary_data)
