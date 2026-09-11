from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.models import (
    User, Industry, Assessment, EnergyInput, MaterialInput, WasteInput,
    TransportInput, ActionPlan
)
from app.database.seed_factors import seed_emission_factors
from app.services.carbon_calculator import CarbonCalculationEngine
from app.services.hotspot_detector import HotspotDetectionEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.circularity_score import CircularityScoringEngine
from app.services.simulator_service import SimulatorService

def seed_demo_factories(db: Session) -> User:
    # First ensure emission factors exist
    seed_emission_factors(db)

    # 1. Create or get demo user
    demo_email = "demo@carboncopilot.ai"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            email=demo_email,
            hashed_password=get_password_hash("demo1234"),
            full_name="Rajesh Verma (Plant Operations Director)",
            role="factory_operator"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    calc_engine = CarbonCalculationEngine(db)
    hotspot_engine = HotspotDetectionEngine(db)
    rec_engine = RecommendationEngine(db)
    circ_engine = CircularityScoringEngine(db)

    # Factory 1: Surat Eco-Weave Textiles (Primary Hackathon Showcase)
    ind1 = db.query(Industry).filter(Industry.user_id == user.id, Industry.company_name == "Surat Eco-Weave Textiles").first()
    if not ind1:
        ind1 = Industry(
            user_id=user.id,
            company_name="Surat Eco-Weave Textiles",
            industry_type="Textile",
            factory_location="Pandesara GIDC, Surat, Gujarat",
            production_type="Synthetic & Blended Fabrics",
            monthly_production=100.0,
            production_unit="tonnes fabric",
            number_of_employees=180,
            operating_hours_per_day=20.0,
            main_energy_sources="Grid electricity (Torrent Power), Thermal Coal boiler, Diesel backup",
            main_raw_materials="Virgin polyester filament yarn, Spun cotton yarn",
            main_waste_types="Fabric cut scrap, Boiler bottom ash, Effluent treatment sludge"
        )
        db.add(ind1)
        db.commit()
        db.refresh(ind1)

        # Assessment 1
        ass1 = Assessment(
            user_id=user.id,
            industry_id=ind1.id,
            name="Q1 2026 Facility Baseline Carbon Audit",
            assessment_period="January - March 2026",
            status="draft"
        )
        db.add(ass1)
        db.commit()
        db.refresh(ass1)

        # Energy inputs
        db.add_all([
            EnergyInput(assessment_id=ass1.id, source_type="grid_electricity", quantity=145000.0, unit="kWh", renewable_percentage=5.0),
            EnergyInput(assessment_id=ass1.id, source_type="coal", quantity=32.0, unit="tonne", renewable_percentage=0.0),
            EnergyInput(assessment_id=ass1.id, source_type="diesel", quantity=1200.0, unit="litre", renewable_percentage=0.0)
        ])
        # Material inputs
        db.add_all([
            MaterialInput(assessment_id=ass1.id, material_name="Polyester Filament Yarn", material_type="Textiles/Fibers", quantity=58.0, unit="tonne", virgin_percentage=90.0, recycled_percentage=10.0, supplier_distance_km=180.0),
            MaterialInput(assessment_id=ass1.id, material_name="Carded Cotton Yarn", material_type="Textiles/Fibers", quantity=32.0, unit="tonne", virgin_percentage=85.0, recycled_percentage=15.0, supplier_distance_km=240.0)
        ])
        # Waste inputs
        db.add_all([
            WasteInput(assessment_id=ass1.id, waste_type="Mixed Fabric Edge Cut Scraps", quantity=11.0, unit="tonne", disposal_method="landfill", recyclable_percentage=20.0),
            WasteInput(assessment_id=ass1.id, waste_type="Boiler Fly & Bottom Ash", quantity=4.5, unit="tonne", disposal_method="landfill", recyclable_percentage=0.0)
        ])
        # Transport inputs
        db.add_all([
            TransportInput(assessment_id=ass1.id, transport_mode="heavy_truck", distance_km=420.0, weight_tonnes=45.0, frequency_per_month=3)
        ])
        db.commit()

        # Run AI Pipeline
        calc_engine.calculate_assessment(ass1.id)
        hotspot_engine.detect_and_rank_hotspots(ass1.id)
        recs = rec_engine.generate_recommendations(ass1.id)
        circ_engine.calculate_circularity_score(ass1.id)

        # Add starter Action Plan items
        if recs:
            top_rec = recs[0]
            db.add(ActionPlan(
                user_id=user.id,
                assessment_id=ass1.id,
                recommendation_id=top_rec.id,
                title=f"Execute Phase 1: {top_rec.title}",
                category=top_rec.category,
                priority="High",
                owner="Vikas Patel (Engineering Chief)",
                deadline="End of Q2 2026",
                estimated_cost_inr=top_rec.implementation_cost_inr,
                expected_co2_reduction_kg=top_rec.estimated_co2_reduction_kg,
                status="In Progress"
            ))
            if len(recs) > 1:
                db.add(ActionPlan(
                    user_id=user.id,
                    assessment_id=ass1.id,
                    recommendation_id=recs[1].id,
                    title=f"Feasibility Study: {recs[1].title}",
                    category=recs[1].category,
                    priority="Medium",
                    owner="Ananya Sharma (Sustainability Lead)",
                    deadline="Q3 2026",
                    estimated_cost_inr=recs[1].implementation_cost_inr,
                    expected_co2_reduction_kg=recs[1].estimated_co2_reduction_kg,
                    status="Planned"
                ))
            db.commit()

    # Factory 2: Punjab Agro-Foods Processing Ltd
    ind2 = db.query(Industry).filter(Industry.user_id == user.id, Industry.company_name == "Punjab Agro-Foods Ltd").first()
    if not ind2:
        ind2 = Industry(
            user_id=user.id,
            company_name="Punjab Agro-Foods Ltd",
            industry_type="Food Processing",
            factory_location="Focal Point Phase IV, Ludhiana, Punjab",
            production_type="Packaged Agro & Dairy Products",
            monthly_production=250.0,
            production_unit="tonnes packaged goods",
            number_of_employees=95,
            operating_hours_per_day=16.0,
            main_energy_sources="Grid electricity, Diesel generators, Natural gas boiler",
            main_raw_materials="Raw wheat, milk derivatives, vegetable oils, seasoning",
            main_waste_types="Organic processing pomace, packaging trimmings, wastewater grease"
        )
        db.add(ind2)
        db.commit()
        db.refresh(ind2)

        ass2 = Assessment(
            user_id=user.id,
            industry_id=ind2.id,
            name="2026 Agro-Processing Carbon Audit",
            assessment_period="Monthly Average 2026",
            status="draft"
        )
        db.add(ass2)
        db.commit()
        db.refresh(ass2)

        db.add_all([
            EnergyInput(assessment_id=ass2.id, source_type="grid_electricity", quantity=95000.0, unit="kWh", renewable_percentage=10.0),
            EnergyInput(assessment_id=ass2.id, source_type="natural_gas", quantity=8500.0, unit="m3", renewable_percentage=0.0),
            EnergyInput(assessment_id=ass2.id, source_type="diesel", quantity=3200.0, unit="litre", renewable_percentage=0.0)
        ])
        db.add_all([
            MaterialInput(assessment_id=ass2.id, material_name="Virgin Packaging Film", material_type="Plastics/Polymers", quantity=14.0, unit="tonne", virgin_percentage=100.0, recycled_percentage=0.0, supplier_distance_km=140.0),
            MaterialInput(assessment_id=ass2.id, material_name="Corrugated Shipping Cartons", material_type="Paper/Cardboard", quantity=18.0, unit="tonne", virgin_percentage=70.0, recycled_percentage=30.0, supplier_distance_km=80.0)
        ])
        db.add_all([
            WasteInput(assessment_id=ass2.id, waste_type="Organic Food Processing Pulp", quantity=38.0, unit="tonne", disposal_method="landfill", recyclable_percentage=0.0),
            WasteInput(assessment_id=ass2.id, waste_type="Plastic Laminate Offcuts", quantity=3.2, unit="tonne", disposal_method="incineration", recyclable_percentage=0.0)
        ])
        db.add_all([
            TransportInput(assessment_id=ass2.id, transport_mode="medium_truck", distance_km=280.0, weight_tonnes=25.0, frequency_per_month=6)
        ])
        db.commit()

        calc_engine.calculate_assessment(ass2.id)
        hotspot_engine.detect_and_rank_hotspots(ass2.id)
        rec_engine.generate_recommendations(ass2.id)
        circ_engine.calculate_circularity_score(ass2.id)

    # Factory 3: GreenPack Polymer & Packaging Solutions
    ind3 = db.query(Industry).filter(Industry.user_id == user.id, Industry.company_name == "GreenPack Polymer Solutions").first()
    if not ind3:
        ind3 = Industry(
            user_id=user.id,
            company_name="GreenPack Polymer Solutions",
            industry_type="Packaging",
            factory_location="Chakan Industrial Area, Pune, Maharashtra",
            production_type="Industrial Extruded Polymers & Cartons",
            monthly_production=180.0,
            production_unit="tonnes packaging",
            number_of_employees=120,
            operating_hours_per_day=24.0,
            main_energy_sources="Grid electricity (MSEDCL), LPG heating ovens",
            main_raw_materials="Virgin HDPE, LDPE pellets, Virgin kraft paper rolls",
            main_waste_types="Extruder purge lumps, trimming scrap, ink washings"
        )
        db.add(ind3)
        db.commit()
        db.refresh(ind3)

        ass3 = Assessment(
            user_id=user.id,
            industry_id=ind3.id,
            name="Packaging Facility Decarbonization Assessment",
            assessment_period="Monthly Audit 2026",
            status="draft"
        )
        db.add(ass3)
        db.commit()
        db.refresh(ass3)

        db.add_all([
            EnergyInput(assessment_id=ass3.id, source_type="grid_electricity", quantity=135000.0, unit="kWh", renewable_percentage=0.0),
            EnergyInput(assessment_id=ass3.id, source_type="lpg", quantity=4200.0, unit="kg", renewable_percentage=0.0)
        ])
        db.add_all([
            MaterialInput(assessment_id=ass3.id, material_name="Virgin HDPE / LDPE Resin", material_type="Plastics/Polymers", quantity=95.0, unit="tonne", virgin_percentage=100.0, recycled_percentage=0.0, supplier_distance_km=320.0),
            MaterialInput(assessment_id=ass3.id, material_name="Virgin Kraft Paper", material_type="Paper/Cardboard", quantity=65.0, unit="tonne", virgin_percentage=80.0, recycled_percentage=20.0, supplier_distance_km=150.0)
        ])
        db.add_all([
            WasteInput(assessment_id=ass3.id, waste_type="Polymer Purge Lumps & Edge Trim", quantity=9.5, unit="tonne", disposal_method="landfill", recyclable_percentage=40.0),
            WasteInput(assessment_id=ass3.id, waste_type="Paper Slitting Dust & Cores", quantity=4.0, unit="tonne", disposal_method="recycling", recyclable_percentage=90.0)
        ])
        db.add_all([
            TransportInput(assessment_id=ass3.id, transport_mode="heavy_truck", distance_km=520.0, weight_tonnes=60.0, frequency_per_month=4)
        ])
        db.commit()

        calc_engine.calculate_assessment(ass3.id)
        hotspot_engine.detect_and_rank_hotspots(ass3.id)
        rec_engine.generate_recommendations(ass3.id)
        circ_engine.calculate_circularity_score(ass3.id)

    # Ensure all assessments for user are fully calculated
    for a in db.query(Assessment).filter(Assessment.user_id == user.id).all():
        if a.total_emissions_tco2e == 0 or a.status != "calculated":
            calc_engine.calculate_assessment(a.id)
            hotspot_engine.detect_and_rank_hotspots(a.id)
            rec_engine.generate_recommendations(a.id)
            circ_engine.calculate_circularity_score(a.id)

    return user
