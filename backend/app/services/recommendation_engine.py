import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Assessment, EmissionHotspot, Recommendation, RecommendationKnowledge

# Industrial Circular Interventions Knowledge Base
KNOWLEDGE_BASE = [
    # Energy Interventions
    {
        "key": "solar_rooftop_ppa",
        "title": "On-Site Rooftop Solar PV Installation (PPA / CAPEX)",
        "category": "Energy",
        "target_source": "Grid Electricity",
        "reduction_pct_range": (25.0, 45.0),
        "cost_multiplier_inr_per_kw": 42000.0, # ~₹42,000 / kWp
        "savings_rate_per_kwh": 4.2, # Displacing ₹8.5/kWh grid with ₹4.3/kWh LCOE
        "feasibility": "High",
        "base_payback_months": 36,
        "circularity_boost": 18.0,
        "reason_template": "Grid electricity is responsible for {pct}% of your emissions. Installing on-site rooftop solar directly cuts Scope 2 emissions while shielding the plant from escalating industrial grid tariffs."
    },
    {
        "key": "waste_heat_recovery",
        "title": "Boiler Economizer & Waste Heat Recovery System",
        "category": "Energy",
        "target_source": "Boiler Coal Combustion",
        "reduction_pct_range": (15.0, 28.0),
        "cost_multiplier_inr_per_kw": 250000.0,
        "savings_rate_per_kwh": 3.0,
        "feasibility": "Medium",
        "base_payback_months": 22,
        "circularity_boost": 12.0,
        "reason_template": "Boiler fuel combustion generates {pct}% of total emissions. Capturing flue gas thermal waste through an economizer reduces coal consumption by 15-25%."
    },
    {
        "key": "biomass_briquette_fuel",
        "title": "Transition Boiler from Thermal Coal to Agro-Biomass Briquettes",
        "category": "Energy",
        "target_source": "Boiler Coal Combustion",
        "reduction_pct_range": (70.0, 85.0),
        "cost_multiplier_inr_per_kw": 450000.0,
        "savings_rate_per_kwh": 1.5,
        "feasibility": "High",
        "base_payback_months": 18,
        "circularity_boost": 25.0,
        "reason_template": "Coal combustion represents a critical Scope 1 leak ({pct}% of total emissions). Switching to locally sourced mustard/sawdust briquettes provides a carbon-neutral circular thermal loop."
    },
    {
        "key": "vfd_ie4_motors",
        "title": "Retrofit Motors & Pumps with IE4 Super-Premium Motors + VFDs",
        "category": "Energy",
        "target_source": "Grid Electricity",
        "reduction_pct_range": (10.0, 18.0),
        "cost_multiplier_inr_per_kw": 18000.0,
        "savings_rate_per_kwh": 5.0,
        "feasibility": "High",
        "base_payback_months": 16,
        "circularity_boost": 8.0,
        "reason_template": "Motor and pump loads consume over 60% of factory electricity. Variable Frequency Drives eliminate throttling losses with swift 16-month financial payback."
    },

    # Materials Interventions
    {
        "key": "recycled_polyester_pet",
        "title": "Substitute 40% Virgin Polyester with GRS-Certified Recycled PET",
        "category": "Materials",
        "target_source": "Virgin",
        "reduction_pct_range": (35.0, 55.0),
        "cost_multiplier_inr_per_kw": 150000.0,
        "savings_rate_per_kwh": 2.0,
        "feasibility": "High",
        "base_payback_months": 14,
        "circularity_boost": 22.0,
        "reason_template": "Virgin raw material synthesis carries heavy embodied carbon ({pct}% of your footprint). Transitioning to recycled feedstock directly cuts Scope 3 upstream footprint while unlocking green export premiums."
    },
    {
        "key": "closed_loop_scrap_recycling",
        "title": "Implement Closed-Loop In-House Scrap Segregation & Re-melting",
        "category": "Materials",
        "target_source": "Virgin",
        "reduction_pct_range": (20.0, 35.0),
        "cost_multiplier_inr_per_kw": 320000.0,
        "savings_rate_per_kwh": 4.0,
        "feasibility": "Medium",
        "base_payback_months": 19,
        "circularity_boost": 20.0,
        "reason_template": "Internal production scrap loses value when downgraded. In-house closed loop recycling preserves virgin material cost while diverting 85% of process losses."
    },
    {
        "key": "corrugated_box_circularity",
        "title": "Adopt 100% Post-Consumer Recycled & Lightweight Packaging",
        "category": "Materials",
        "target_source": "Paper",
        "reduction_pct_range": (40.0, 60.0),
        "cost_multiplier_inr_per_kw": 80000.0,
        "savings_rate_per_kwh": 1.2,
        "feasibility": "High",
        "base_payback_months": 9,
        "circularity_boost": 15.0,
        "reason_template": "Packaging material contributes {pct}% to material emissions. Switching to 100% recycled paperboard cuts packaging procurement cost by 8-12%."
    },

    # Waste Interventions
    {
        "key": "zero_waste_landfill",
        "title": "Zero Waste to Landfill: Industrial Symbiosis & Co-Processing",
        "category": "Waste",
        "target_source": "Landfill",
        "reduction_pct_range": (65.0, 85.0),
        "cost_multiplier_inr_per_kw": 120000.0,
        "savings_rate_per_kwh": 1.0,
        "feasibility": "High",
        "base_payback_months": 12,
        "circularity_boost": 28.0,
        "reason_template": "Landfill disposal of factory waste generates fugitive methane and Scope 3 emissions ({pct}% of total). Partnering with authorized co-processors eliminates disposal fees."
    },
    {
        "key": "organic_biogas_digester",
        "title": "On-Site Anaerobic Biogas Digester for Organic Food Waste",
        "category": "Waste",
        "target_source": "Organic",
        "reduction_pct_range": (60.0, 80.0),
        "cost_multiplier_inr_per_kw": 280000.0,
        "savings_rate_per_kwh": 2.5,
        "feasibility": "Medium",
        "base_payback_months": 24,
        "circularity_boost": 24.0,
        "reason_template": "Organic waste decomposing in landfills is a potent methane source. Capturing biogas offsets plant canteen/boiler LPG usage while producing organic fertilizer."
    },

    # Transport Interventions
    {
        "key": "logistics_route_consolidation",
        "title": "AI Logistics Load Consolidation & Regional Supplier Sourcing",
        "category": "Transport",
        "target_source": "Truck",
        "reduction_pct_range": (20.0, 35.0),
        "cost_multiplier_inr_per_kw": 95000.0,
        "savings_rate_per_kwh": 3.0,
        "feasibility": "High",
        "base_payback_months": 8,
        "circularity_boost": 10.0,
        "reason_template": "Logistics operations represent {pct}% of your carbon profile. Optimizing truck load fill rates and switching to closer tier-2 suppliers cuts freight cost by 18%."
    },
    {
        "key": "electric_fleet_transition",
        "title": "Phase-in Commercial EV Fleet for Local Distribution",
        "category": "Transport",
        "target_source": "Truck",
        "reduction_pct_range": (45.0, 65.0),
        "cost_multiplier_inr_per_kw": 600000.0,
        "savings_rate_per_kwh": 4.5,
        "feasibility": "Medium",
        "base_payback_months": 30,
        "circularity_boost": 14.0,
        "reason_template": "Diesel trucks produce significant tailpipe emissions ({pct}% share). Electric commercial vans provide 70% lower running costs per km."
    }
]

class RecommendationEngine:
    def __init__(self, db: Session):
        self.db = db

    def generate_recommendations(self, assessment_id: int) -> List[Recommendation]:
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError(f"Assessment {assessment_id} not found")

        hotspots = self.db.query(EmissionHotspot).filter(EmissionHotspot.assessment_id == assessment_id).all()
        if not hotspots:
            return []

        # Clear existing recommendations
        self.db.query(Recommendation).filter(Recommendation.assessment_id == assessment_id).delete()

        recommendations_to_add = []
        hotspot_map = {h.source_name: h for h in hotspots}

        total_potential_co2_kg = 0.0
        total_potential_savings = 0.0
        # Query active rules from database or fallback to KNOWLEDGE_BASE
        db_rules = self.db.query(RecommendationKnowledge).filter(RecommendationKnowledge.is_active == True).all()
        if db_rules:
            active_rules = [
                {
                    "key": r.key,
                    "title": r.title,
                    "category": r.category,
                    "target_source": r.target_source,
                    "reduction_pct_range": (r.reduction_min_pct, r.reduction_max_pct),
                    "cost_multiplier_inr_per_kw": r.cost_multiplier_inr_per_kw,
                    "savings_rate_per_kwh": r.savings_rate_per_kwh,
                    "feasibility": r.feasibility,
                    "base_payback_months": r.base_payback_months,
                    "circularity_boost": r.circularity_boost,
                    "reason_template": r.reason_template
                }
                for r in db_rules
            ]
        else:
            active_rules = KNOWLEDGE_BASE

        for item in active_rules:
            # Find matching hotspot
            matched_hotspot = None
            for h in hotspots:
                if item["target_source"].lower() in h.source_name.lower():
                    matched_hotspot = h
                    break

            if not matched_hotspot:
                # If category matches any high or critical hotspot
                for h in hotspots:
                    if h.category == item["category"] and h.severity in ["Critical", "High"]:
                        matched_hotspot = h
                        break

            if not matched_hotspot:
                continue

            # Calculate tailored impact
            target_emissions = matched_hotspot.emissions_kg_co2e
            avg_reduction_pct = (item["reduction_pct_range"][0] + item["reduction_pct_range"][1]) / 2.0
            co2_reduction_kg = round(target_emissions * (avg_reduction_pct / 100.0), 2)
            
            # Scaled cost model in INR (Lakhs range for SME factories)
            # Baseline investment proportional to emissions avoided and category
            if item["category"] == "Energy":
                est_cost = max(250000.0, round((co2_reduction_kg / 1000.0) * 18000.0, -3)) # ~₹18,000/tCO2 avoided
                ann_savings = round(est_cost * 0.38, -2) # ~2.6 year payback
            elif item["category"] == "Materials":
                est_cost = max(180000.0, round((co2_reduction_kg / 1000.0) * 12000.0, -3))
                ann_savings = round(est_cost * 0.52, -2) # ~1.9 year payback
            elif item["category"] == "Waste":
                est_cost = max(90000.0, round((co2_reduction_kg / 1000.0) * 8000.0, -3))
                ann_savings = round(est_cost * 0.65, -2) # ~1.5 year payback
            else: # Transport
                est_cost = max(150000.0, round((co2_reduction_kg / 1000.0) * 10000.0, -3))
                ann_savings = round(est_cost * 0.45, -2)

            payback_months = max(6.0, round((est_cost / max(ann_savings, 1000.0)) * 12.0, 1))

            # Multi-Attribute Recommendation Score
            # 30% CO2 impact + 20% Cost effectiveness + 20% Feasibility + 15% Savings + 15% Circularity
            co2_norm = min(30.0, (co2_reduction_kg / 20000.0) * 30.0)
            cost_eff_norm = min(20.0, (ann_savings / est_cost) * 20.0)
            feas_norm = 20.0 if item["feasibility"] == "High" else (15.0 if item["feasibility"] == "Medium" else 10.0)
            savings_norm = min(15.0, (ann_savings / 500000.0) * 15.0)
            circ_norm = min(15.0, (item["circularity_boost"] / 25.0) * 15.0)
            rec_score = round(co2_norm + cost_eff_norm + feas_norm + savings_norm + circ_norm, 1)

            reason_text = item["reason_template"].format(pct=matched_hotspot.percentage_contribution)
            assumptions = {
                "calculation_basis": f"Targets {matched_hotspot.source_name} producing {matched_hotspot.emissions_kg_co2e} kg CO2e ({matched_hotspot.percentage_contribution}% of factory total).",
                "reduction_rate": f"{avg_reduction_pct}% reduction applied based on verified sector benchmark.",
                "financial_model": f"Capital cost estimated at ₹{est_cost:,.0f} with projected annual energy/raw material savings of ₹{ann_savings:,.0f} yielding a {payback_months}-month payback period.",
                "regulatory_context": "Directly supports compliance with India Energy Conservation Act (BEE PAT Scheme) and BRSR Scope 1-3 disclosures."
            }

            rec = Recommendation(
                assessment_id=assessment_id,
                recommendation_key=item["key"],
                title=item["title"],
                category=item["category"],
                target_emission_source=matched_hotspot.source_name,
                reason=reason_text,
                estimated_co2_reduction_kg=co2_reduction_kg,
                reduction_percentage=round(avg_reduction_pct, 1),
                implementation_cost_inr=est_cost,
                annual_savings_inr=ann_savings,
                payback_months=payback_months,
                feasibility=item["feasibility"],
                priority_rank=1, # Updated after sorting
                confidence="High",
                circularity_boost=item["circularity_boost"],
                assumptions=json.dumps(assumptions)
            )
            recommendations_to_add.append((rec_score, rec))
            total_potential_co2_kg += co2_reduction_kg
            total_potential_savings += ann_savings

        # Sort by recommendation score descending
        recommendations_to_add.sort(key=lambda x: x[0], reverse=True)
        final_recs = []
        for rank, (score, rec) in enumerate(recommendations_to_add, 1):
            rec.priority_rank = rank
            self.db.add(rec)
            final_recs.append(rec)

        # Update assessment potential reduction (capped realistically at 60% of total)
        max_possible_red_t = (assessment.total_emissions_tco2e * 0.58)
        assessment.potential_reduction_tco2e = min(max_possible_red_t, round(total_potential_co2_kg / 1000.0, 2))
        assessment.potential_savings_inr = round(total_potential_savings, 2)
        self.db.commit()

        return final_recs
