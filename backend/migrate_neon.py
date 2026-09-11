import sys
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.demo_seed import seed_demo_factories
from app.models.models import User, Industry, Assessment, EmissionHotspot, Recommendation

print("Connecting to Neon PostgreSQL...")
print("Database host:", settings.DATABASE_URL.split("@")[-1].split("/")[0])

print("Creating all tables in Neon PostgreSQL...")
Base.metadata.create_all(bind=engine)
print("[SUCCESS] All database tables created on Neon PostgreSQL!")

print("Seeding demo factories and verified emission factors...")
db = SessionLocal()
try:
    user = seed_demo_factories(db)
    print(f"[SUCCESS] Demo user verified: {user.email}")
    
    industries = db.query(Industry).all()
    print(f"[SUCCESS] {len(industries)} Industrial facilities created in Neon DB:")
    for ind in industries:
        print(f"  • {ind.company_name} ({ind.industry_type}) - {ind.factory_location}")
        
    assessments = db.query(Assessment).all()
    print(f"[SUCCESS] {len(assessments)} Factory carbon assessments created in Neon DB:")
    for a in assessments:
        print(f"  • {a.name}: {a.total_emissions_tco2e} tCO2e | Circularity: {a.circularity_score}/100")
        
    hotspots = db.query(EmissionHotspot).all()
    print(f"[SUCCESS] {len(hotspots)} Emission hotspots detected and stored in Neon DB.")

    recs = db.query(Recommendation).all()
    print(f"[SUCCESS] {len(recs)} Circular recommendations generated and stored in Neon DB.")
finally:
    db.close()

print("\n>>> NEON POSTGRESQL MIGRATION & SEEDING COMPLETED 100% SUCCESSFULLY! <<<")
