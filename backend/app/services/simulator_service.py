from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Assessment, EmissionResult, Scenario

class SimulatorService:
    def __init__(self, db: Session):
        self.db = db

    def simulate(self, assessment_id: int, solar_pct: float, recycled_pct: float, waste_rec_pct: float, transport_red_pct: float) -> Dict[str, Any]:
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError(f"Assessment {assessment_id} not found")

        results = self.db.query(EmissionResult).filter(EmissionResult.assessment_id == assessment_id).all()
        baseline_total_kg = sum(r.emissions_kg_co2e for r in results)
        if baseline_total_kg <= 0:
            baseline_total_kg = max(1000.0, assessment.total_emissions_tco2e * 1000.0)

        # Categorize baseline emissions
        energy_kg = sum(r.emissions_kg_co2e for r in results if r.category == "Energy")
        materials_kg = sum(r.emissions_kg_co2e for r in results if r.category == "Materials")
        waste_kg = sum(r.emissions_kg_co2e for r in results if r.category == "Waste")
        transport_kg = sum(r.emissions_kg_co2e for r in results if r.category == "Transport")

        # 1. Solar impact: Displaces grid electricity emissions (~0.716 to ~0.041 kg/kWh, ~94% reduction on solar share)
        solar_avoided_kg = energy_kg * (solar_pct / 100.0) * 0.94
        solar_capex_inr = (solar_avoided_kg / 1000.0) * 22000.0 # ~₹22,000 / tCO2 avoided
        solar_savings_inr = (solar_avoided_kg / 1000.0) * 7800.0 # ~₹7,800 / tCO2 avoided per year

        # 2. Recycled material impact: Displaces virgin materials (~60% average carbon savings per unit recycled)
        recycled_avoided_kg = materials_kg * (recycled_pct / 100.0) * 0.60
        materials_capex_inr = (recycled_avoided_kg / 1000.0) * 14000.0
        materials_savings_inr = (recycled_avoided_kg / 1000.0) * 6500.0

        # 3. Waste recovery impact: Diverts landfill waste to recycling/symbiosis (~80% reduction in landfill methane)
        waste_avoided_kg = waste_kg * (waste_rec_pct / 100.0) * 0.80
        waste_capex_inr = (waste_avoided_kg / 1000.0) * 8000.0
        waste_savings_inr = (waste_avoided_kg / 1000.0) * 5200.0

        # 4. Transport route / load optimization impact
        transport_avoided_kg = transport_kg * (transport_red_pct / 100.0) * 0.85
        transport_capex_inr = (transport_avoided_kg / 1000.0) * 9000.0
        transport_savings_inr = (transport_avoided_kg / 1000.0) * 8200.0

        total_avoided_kg = solar_avoided_kg + recycled_avoided_kg + waste_avoided_kg + transport_avoided_kg
        simulated_total_kg = max(0.0, baseline_total_kg - total_avoided_kg)

        baseline_t = round(baseline_total_kg / 1000.0, 2)
        simulated_t = round(simulated_total_kg / 1000.0, 2)
        avoided_t = round(total_avoided_kg / 1000.0, 2)
        reduction_pct = round((avoided_t / baseline_t) * 100.0, 1) if baseline_t > 0 else 0.0

        total_capex = round(solar_capex_inr + materials_capex_inr + waste_capex_inr + transport_capex_inr, -2)
        total_annual_savings = round(solar_savings_inr + materials_savings_inr + waste_savings_inr + transport_savings_inr, -2)
        payback_months = max(4.0, round((total_capex / max(total_annual_savings, 1000.0)) * 12.0, 1)) if total_capex > 0 else 0.0

        # Dynamic Circularity Score update
        baseline_circ = assessment.circularity_score or 35.0
        circ_gain = (solar_pct * 0.22) + (recycled_pct * 0.28) + (waste_rec_pct * 0.28) + (transport_red_pct * 0.12)
        new_circ = min(100.0, round(baseline_circ + (circ_gain * 0.45), 1))

        return {
            "baseline_co2e_t": baseline_t,
            "simulated_co2e_t": simulated_t,
            "avoided_co2e_t": avoided_t,
            "reduction_percentage": reduction_pct,
            "estimated_capex_inr": total_capex,
            "estimated_annual_savings_inr": total_annual_savings,
            "payback_months": payback_months,
            "new_circularity_score": new_circ,
            "baseline_circularity_score": baseline_circ,
            "circularity_delta": round(new_circ - baseline_circ, 1),
            "breakdown": {
                "energy_avoided_t": round(solar_avoided_kg / 1000.0, 2),
                "materials_avoided_t": round(recycled_avoided_kg / 1000.0, 2),
                "waste_avoided_t": round(waste_avoided_kg / 1000.0, 2),
                "transport_avoided_t": round(transport_avoided_kg / 1000.0, 2),
            },
            "summary_message": f"Simulating this circular pathway cuts emissions by {reduction_pct}% ({avoided_t} tCO2e/yr) with estimated annual operational savings of ₹{total_annual_savings:,.0f} and payback within {payback_months} months."
        }

    def generate_preset_scenarios(self, assessment_id: int) -> List[Dict[str, Any]]:
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError("Assessment not found")

        baseline_t = assessment.total_emissions_tco2e
        baseline_circ = assessment.circularity_score or 35.0

        # Scenario A: Baseline
        scen_a = {
            "name": "Current Baseline",
            "description": "Business as usual with no additional circular interventions.",
            "solar_percentage": 0.0,
            "recycled_material_percentage": 0.0,
            "waste_recovery_percentage": 0.0,
            "transport_reduction_percentage": 0.0,
            "result_co2e_tonnes": baseline_t,
            "reduction_percentage": 0.0,
            "cost_estimate_inr": 0.0,
            "annual_savings_inr": 0.0,
            "payback_months": 0.0,
            "circularity_score": baseline_circ,
            "is_recommended": False
        }

        # Scenario B: Solar Transition
        sim_b = self.simulate(assessment_id, solar_pct=35.0, recycled_pct=0.0, waste_rec_pct=15.0, transport_red_pct=0.0)
        scen_b = {
            "name": "Solar & Clean Power",
            "description": "Install 35% on-site solar rooftop and basic waste segregation.",
            "solar_percentage": 35.0,
            "recycled_material_percentage": 0.0,
            "waste_recovery_percentage": 15.0,
            "transport_reduction_percentage": 0.0,
            "result_co2e_tonnes": sim_b["simulated_co2e_t"],
            "reduction_percentage": sim_b["reduction_percentage"],
            "cost_estimate_inr": sim_b["estimated_capex_inr"],
            "annual_savings_inr": sim_b["estimated_annual_savings_inr"],
            "payback_months": sim_b["payback_months"],
            "circularity_score": sim_b["new_circularity_score"],
            "is_recommended": False
        }

        # Scenario C: Recycled Materials Focus
        sim_c = self.simulate(assessment_id, solar_pct=10.0, recycled_pct=45.0, waste_rec_pct=40.0, transport_red_pct=15.0)
        scen_c = {
            "name": "Circular Feedstock & Zero Waste",
            "description": "Substitute 45% virgin raw materials with recycled content & 40% waste diversion.",
            "solar_percentage": 10.0,
            "recycled_material_percentage": 45.0,
            "waste_recovery_percentage": 40.0,
            "transport_reduction_percentage": 15.0,
            "result_co2e_tonnes": sim_c["simulated_co2e_t"],
            "reduction_percentage": sim_c["reduction_percentage"],
            "cost_estimate_inr": sim_c["estimated_capex_inr"],
            "annual_savings_inr": sim_c["estimated_annual_savings_inr"],
            "payback_months": sim_c["payback_months"],
            "circularity_score": sim_c["new_circularity_score"],
            "is_recommended": False
        }

        # Scenario D: Maximum Circularity
        sim_d = self.simulate(assessment_id, solar_pct=50.0, recycled_pct=55.0, waste_rec_pct=75.0, transport_red_pct=30.0)
        scen_d = {
            "name": "Maximum Circularity (Recommended)",
            "description": "Comprehensive transition: 50% solar, 55% recycled materials, 75% waste recovery, 30% logistics density.",
            "solar_percentage": 50.0,
            "recycled_material_percentage": 55.0,
            "waste_recovery_percentage": 75.0,
            "transport_reduction_percentage": 30.0,
            "result_co2e_tonnes": sim_d["simulated_co2e_t"],
            "reduction_percentage": sim_d["reduction_percentage"],
            "cost_estimate_inr": sim_d["estimated_capex_inr"],
            "annual_savings_inr": sim_d["estimated_annual_savings_inr"],
            "payback_months": sim_d["payback_months"],
            "circularity_score": sim_d["new_circularity_score"],
            "is_recommended": True
        }

        return [scen_a, scen_b, scen_c, scen_d]
