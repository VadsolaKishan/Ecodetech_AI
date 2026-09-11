from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Assessment, Industry, EmissionHotspot, Recommendation
from app.services.simulator_service import SimulatorService

class AssistantService:
    def __init__(self, db: Session):
        self.db = db
        self.simulator = SimulatorService(db)

    def answer_query(self, assessment_id: Optional[int], message: str) -> Dict[str, Any]:
        msg = message.lower().strip()
        
        if not assessment_id:
            return {
                "response": "Please select or create an active factory carbon assessment first so I can ground answers in your verified plant data.",
                "context_used": {}
            }

        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            return {
                "response": "I don't have enough data to calculate this accurately. The requested assessment could not be located.",
                "context_used": {}
            }

        industry = assessment.industry
        hotspots = self.db.query(EmissionHotspot).filter(EmissionHotspot.assessment_id == assessment_id).order_by(EmissionHotspot.percentage_contribution.desc()).all()
        recommendations = self.db.query(Recommendation).filter(Recommendation.assessment_id == assessment_id).order_by(Recommendation.priority_rank.asc()).all()

        context = {
            "factory_name": industry.company_name if industry else "Factory",
            "industry_type": industry.industry_type if industry else "Manufacturing",
            "total_emissions_tco2e": assessment.total_emissions_tco2e,
            "scope1": assessment.scope1_tco2e,
            "scope2": assessment.scope2_tco2e,
            "scope3": assessment.scope3_tco2e,
            "circularity_score": assessment.circularity_score,
            "top_hotspot": hotspots[0].source_name if hotspots else "N/A",
            "top_hotspot_pct": hotspots[0].percentage_contribution if hotspots else 0.0,
            "top_rec": recommendations[0].title if recommendations else "N/A"
        }

        # 1. "Where are my biggest emissions?"
        if any(w in msg for w in ["biggest", "where", "largest", "highest emission", "hotspot"]):
            if not hotspots:
                return {"response": "No hotspot data has been calculated yet. Please run the AI Carbon Analysis on your assessment first.", "context_used": context}
            
            top_lines = []
            for h in hotspots[:3]:
                top_lines.append(f"• **{h.source_name}** ({h.category}): **{h.percentage_contribution}%** of total ({h.emissions_kg_co2e:,.0f} kg CO₂e) — *Severity: {h.severity}*")
            
            resp = (
                f"Based on verified data for **{context['factory_name']}**, your largest emission leak points are:\n\n"
                + "\n".join(top_lines) +
                f"\n\n**Key Insight:** {hotspots[0].source_name} is your critical focal point. Prioritizing interventions here will generate the highest decarbonization leverage."
            )
            return {"response": resp, "context_used": context}

        # 2. "How much CO2 can I save if I use X% solar?"
        if "solar" in msg:
            import re
            numbers = re.findall(r'\b\d+\b', msg)
            pct = float(numbers[0]) if numbers else 40.0
            if pct > 100:
                pct = 100.0
            
            sim = self.simulator.simulate(assessment_id, solar_pct=pct, recycled_pct=0.0, waste_rec_pct=0.0, transport_red_pct=0.0)
            resp = (
                f"Simulating **{pct:.0f}% Solar Adoption** for {context['factory_name']}:\n\n"
                f"• **CO₂ Avoided:** **{sim['avoided_co2e_t']} tonnes CO₂e/yr** ({sim['reduction_percentage']}% footprint reduction)\n"
                f"• **New Total Emissions:** {sim['simulated_co2e_t']} tCO₂e/yr (down from {sim['baseline_co2e_t']} tCO₂e)\n"
                f"• **Estimated Investment:** ₹{sim['estimated_capex_inr']:,.0f}\n"
                f"• **Projected Annual Savings:** ₹{sim['estimated_annual_savings_inr']:,.0f}/year\n"
                f"• **Payback Period:** **{sim['payback_months']} months**\n"
                f"• **Circularity Score Impact:** Increases by **+{sim['circularity_delta']} points** to **{sim['new_circularity_score']}/100**."
            )
            return {"response": resp, "context_used": context}

        # 3. "Which recommendation gives fastest ROI / payback?"
        if any(w in msg for w in ["fastest roi", "payback", "roi", "quickest"]):
            if not recommendations:
                return {"response": "No recommendations generated yet. Please run the analysis first.", "context_used": context}
            
            fastest = min(recommendations, key=lambda r: r.payback_months)
            resp = (
                f"The fastest ROI circular intervention for your facility is:\n\n"
                f"⭐ **{fastest.title}**\n"
                f"• **Payback Period:** Just **{fastest.payback_months} months**\n"
                f"• **Annual Savings:** ₹{fastest.annual_savings_inr:,.0f} / year\n"
                f"• **Capital Investment:** ₹{fastest.implementation_cost_inr:,.0f}\n"
                f"• **CO₂ Cut:** {fastest.estimated_co2_reduction_kg:,.0f} kg CO₂e ({fastest.reduction_percentage}% reduction)\n\n"
                f"**Why it works:** {fastest.reason}"
            )
            return {"response": resp, "context_used": context}

        # 4. "What should I implement first?"
        if any(w in msg for w in ["implement first", "first", "priority", "start with"]):
            if not recommendations:
                return {"response": "No recommendations generated yet. Please run the analysis first.", "context_used": context}
            
            p1 = recommendations[0]
            resp = (
                f"CarbonCopilot recommends implementing **Priority 1: {p1.title}** first.\n\n"
                f"• **Target Hotspot:** {p1.target_emission_source}\n"
                f"• **CO₂ Reduction:** {p1.estimated_co2_reduction_kg:,.0f} kg CO₂e\n"
                f"• **Estimated Investment:** ₹{p1.implementation_cost_inr:,.0f}\n"
                f"• **Annual Savings:** ₹{p1.annual_savings_inr:,.0f}\n"
                f"• **Payback:** {p1.payback_months} months | Feasibility: {p1.feasibility}\n\n"
                f"**Strategic Rationale:** {p1.reason}"
            )
            return {"response": resp, "context_used": context}

        # 5. "How to reduce electricity / energy emissions?"
        if any(w in msg for w in ["electricity", "energy", "power", "grid"]):
            energy_recs = [r for r in recommendations if r.category == "Energy"]
            if energy_recs:
                recs_str = "\n".join([f"• **{r.title}**: Saves ₹{r.annual_savings_inr:,.0f}/yr (Payback: {r.payback_months} mos, CO₂ cut: {r.estimated_co2_reduction_kg:,.0f} kg)" for r in energy_recs[:2]])
                resp = (
                    f"To tackle electricity emissions ({context['scope2']} tCO₂e Scope 2) at {context['factory_name']}:\n\n"
                    f"{recs_str}\n\n"
                    f"You can also use the What-If Simulator to test different on-site solar capacities!"
                )
                return {"response": resp, "context_used": context}

        # Generic summary
        resp = (
            f"Hello! I am CarbonCopilot, your industrial decarbonization copilot for **{context['factory_name']}**.\n\n"
            f"• **Current Footprint:** {context['total_emissions_tco2e']} tCO₂e (Scope 1: {context['scope1']}t | Scope 2: {context['scope2']}t | Scope 3: {context['scope3']}t)\n"
            f"• **Primary Emission Hotspot:** {context['top_hotspot']} ({context['top_hotspot_pct']}%)\n"
            f"• **Circularity Score:** {context['circularity_score']}/100\n"
            f"• **Top Decarbonization Action:** {context['top_rec']}\n\n"
            f"You can ask me questions like:\n"
            f"- *'Where are my biggest emissions?'*\n"
            f"- *'How much CO₂ can I save if I use 40% solar?'*\n"
            f"- *'Which recommendation gives the fastest ROI?'*\n"
            f"- *'What should I implement first?'*"
        )
        return {"response": resp, "context_used": context}
