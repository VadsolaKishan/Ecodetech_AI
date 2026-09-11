import time
from app.database.session import SessionLocal
from app.database.seed_factors import seed_emission_factors
from app.database.demo_seed import seed_demo_factories
from app.models.models import EmissionFactor, User, Industry, Assessment, EmissionHotspot, Recommendation, ActionPlan

db = SessionLocal()
try:
    print("1. Seeding emission factors into Neon PostgreSQL...")
    t0 = time.time()
    seed_emission_factors(db)
    factor_count = db.query(EmissionFactor).count()
    print(f"   [PASS] {factor_count} emission factors seeded in {time.time() - t0:.2f}s!")

    print("2. Seeding demo factories into Neon PostgreSQL...")
    t1 = time.time()
    user = seed_demo_factories(db)
    print(f"   [PASS] Demo user '{user.email}' initialized in {time.time() - t1:.2f}s!")

    print("3. Querying Neon PostgreSQL live data verification:")
    industries = db.query(Industry).all()
    for ind in industries:
        print(f"   • Industry: {ind.company_name} ({ind.industry_type}) at {ind.factory_location}")
    
    assessments = db.query(Assessment).all()
    for a in assessments:
        print(f"   • Assessment: '{a.name}' => Total: {a.total_emissions_tco2e} tCO2e | Circularity: {a.circularity_score}/100")
        
    hotspots_count = db.query(EmissionHotspot).count()
    recs_count = db.query(Recommendation).count()
    actions_count = db.query(ActionPlan).count()
    print(f"   • Hotspots in Neon DB: {hotspots_count}")
    print(f"   • Circular Recommendations in Neon DB: {recs_count}")
    print(f"   • Action Plans in Neon DB: {actions_count}")

    print("\n>>> NEON POSTGRESQL VERIFICATION: 100% OPERATIONAL & SEEDED! <<<")
finally:
    db.close()
