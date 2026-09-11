from app.database.session import SessionLocal
from app.models.models import Assessment, EmissionHotspot, Recommendation

db = SessionLocal()
a = db.query(Assessment).first()
print(f"=== FACTORY: {a.industry.company_name} ===")
print(f"Total Emissions: {a.total_emissions_tco2e} tCO2e")
print(f"Scope 1: {a.scope1_tco2e} tCO2e | Scope 2: {a.scope2_tco2e} tCO2e | Scope 3: {a.scope3_tco2e} tCO2e")
print(f"Circularity Score: {a.circularity_score}/100")
print("\n=== TOP HOTSPOTS ===")
for h in db.query(EmissionHotspot).filter(EmissionHotspot.assessment_id == a.id).order_by(EmissionHotspot.percentage_contribution.desc()).all()[:5]:
    print(f"- {h.source_name} ({h.category}): {h.percentage_contribution}% | {h.emissions_kg_co2e:,.0f} kg CO2e | Severity: {h.severity}")

print("\n=== TOP CIRCULAR RECOMMENDATIONS ===")
for r in db.query(Recommendation).filter(Recommendation.assessment_id == a.id).order_by(Recommendation.priority_rank.asc()).all()[:4]:
    print(f"Priority {r.priority_rank}: {r.title}")
    print(f"  CO2 Cut: {r.estimated_co2_reduction_kg:,.0f} kg ({r.reduction_percentage}%) | CAPEX: INR {r.implementation_cost_inr:,.0f} | Savings: INR {r.annual_savings_inr:,.0f}/yr | Payback: {r.payback_months} mos")
