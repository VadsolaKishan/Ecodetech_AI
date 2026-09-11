from typing import Dict, Any, Optional, List
import re
from sqlalchemy.orm import Session
from app.models.models import Assessment, EmissionHotspot, Recommendation
from app.services.simulator_service import SimulatorService
from app.services.llm_service import GeminiService

class AssistantService:
    def __init__(self, db: Session):
        self.db = db
        self.simulator = SimulatorService(db)
        self.llm_service = GeminiService()

    def answer_query(
        self,
        assessment_id: Optional[int],
        message: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        if not assessment_id:
            return {
                "response": "Please select or create an active factory carbon assessment first so I can ground answers in your verified plant data.",
                "context_used": {},
                "model_used": "EcoDetect Heuristic Engine",
                "is_llm_active": False
            }

        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            return {
                "response": "I don't have enough data to calculate this accurately. The requested assessment could not be located in the database.",
                "context_used": {},
                "model_used": "EcoDetect Heuristic Engine",
                "is_llm_active": False
            }

        industry = assessment.industry
        factory = assessment.factory
        hotspots = self.db.query(EmissionHotspot).filter(EmissionHotspot.assessment_id == assessment_id).order_by(EmissionHotspot.percentage_contribution.desc()).all()
        recommendations = self.db.query(Recommendation).filter(Recommendation.assessment_id == assessment_id).order_by(Recommendation.priority_rank.asc()).all()

        factory_name = factory.name if factory else (industry.company_name if industry else "Factory")
        industry_type = factory.sector if (factory and factory.sector) else (industry.industry_type if industry else "Manufacturing")
        factory_loc = factory.location if factory else (industry.factory_location if industry else "India")

        # Collect detailed hotspots
        hotspots_detail = [
            {
                "name": h.source_name,
                "category": h.category,
                "pct": h.percentage_contribution,
                "emissions_kg": h.emissions_kg_co2e,
                "severity": h.severity
            }
            for h in hotspots
        ]

        # Collect detailed recommendations
        recs_detail = [
            {
                "title": r.title,
                "category": r.category,
                "payback_months": r.payback_months,
                "cost_inr": r.implementation_cost_inr,
                "savings_inr": r.annual_savings_inr,
                "co2_reduction_kg": r.estimated_co2_reduction_kg,
                "reduction_pct": r.reduction_percentage,
                "feasibility": r.feasibility,
                "reason": r.reason
            }
            for r in recommendations
        ]

        # Collect energy sources logged
        energy_sources = []
        if assessment.energy_inputs:
            for ei in assessment.energy_inputs:
                energy_sources.append(f"{ei.source_type} ({ei.quantity} {ei.unit}, {ei.renewable_percentage}% renewable)")

        # Prepare context payload
        context = {
            "factory_name": factory_name,
            "industry_type": industry_type,
            "factory_location": factory_loc,
            "monthly_production": industry.monthly_production if industry else 0.0,
            "production_unit": industry.production_unit if industry else "tonnes",
            "total_emissions_tco2e": round(assessment.total_emissions_tco2e or 0.0, 2),
            "scope1": round(assessment.scope1_tco2e or 0.0, 2),
            "scope2": round(assessment.scope2_tco2e or 0.0, 2),
            "scope3": round(assessment.scope3_tco2e or 0.0, 2),
            "circularity_score": round(assessment.circularity_score or 0.0, 1),
            "emission_intensity": round(assessment.emission_intensity or 0.0, 3),
            "top_hotspot": hotspots[0].source_name if hotspots else "N/A",
            "top_hotspot_pct": hotspots[0].percentage_contribution if hotspots else 0.0,
            "top_rec": recommendations[0].title if recommendations else "N/A",
            "hotspots_detail": hotspots_detail,
            "recommendations_detail": recs_detail,
            "energy_sources": energy_sources
        }

        # If user asks a what-if solar query, dynamically run simulation and add to context
        msg_lower = message.lower()
        if "solar" in msg_lower:
            numbers = re.findall(r'\b\d+\b', message)
            pct = float(numbers[0]) if numbers else 40.0
            if pct > 100:
                pct = 100.0
            try:
                sim = self.simulator.simulate(assessment_id, solar_pct=pct, recycled_pct=0.0, waste_rec_pct=0.0, transport_red_pct=0.0)
                context["simulated_solar"] = {
                    "solar_pct": pct,
                    "avoided_co2e_t": sim.get("avoided_co2e_t"),
                    "new_total_co2e_t": sim.get("simulated_co2e_t"),
                    "reduction_pct": sim.get("reduction_percentage"),
                    "capex_inr": sim.get("estimated_capex_inr"),
                    "annual_savings_inr": sim.get("estimated_annual_savings_inr"),
                    "payback_months": sim.get("payback_months"),
                    "new_circularity_score": sim.get("new_circularity_score")
                }
            except Exception:
                pass

        # Generate LLM response (or grounded heuristic fallback)
        llm_result = self.llm_service.generate_chat_response(
            message=message,
            context=context,
            history=history
        )

        return {
            "response": llm_result.get("response", ""),
            "context_used": {
                "factory_name": context["factory_name"],
                "total_emissions_tco2e": context["total_emissions_tco2e"],
                "scope1": context["scope1"],
                "scope2": context["scope2"],
                "scope3": context["scope3"],
                "circularity_score": context["circularity_score"],
                "top_hotspot": context["top_hotspot"],
                "top_rec": context["top_rec"]
            },
            "model_used": llm_result.get("model_used"),
            "is_llm_active": llm_result.get("is_llm_active", False)
        }
