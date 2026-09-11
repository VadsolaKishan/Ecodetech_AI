from app.database.session import SessionLocal
from app.models.models import Industry, Assessment, EmissionHotspot, Recommendation

print("Testing 5 consecutive queries through SQLAlchemy session...")
for i in range(5):
    db = SessionLocal()
    try:
        ind = db.query(Industry).first()
        ass = db.query(Assessment).first()
        hot = db.query(EmissionHotspot).count()
        rec = db.query(Recommendation).count()
        print(f"Query {i+1}: Industry={ind.company_name}, Total={ass.total_emissions_tco2e} tCO2e, Hotspots={hot}, Recs={rec}")
    finally:
        db.close()

print("\n>>> ALL 5 CONSECUTIVE QUERIES SUCCEEDED WITH ZERO SSL ERRORS! <<<")
