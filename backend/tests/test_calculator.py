import pytest
from app.database.session import SessionLocal, Base, engine
from app.database.seed_factors import seed_emission_factors
from app.services.carbon_calculator import (
    normalize_energy, normalize_mass_to_kg, CarbonCalculationEngine
)
from app.models.models import Industry, Assessment, EnergyInput, MaterialInput, WasteInput, TransportInput

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_emission_factors(db)
    yield db
    db.close()

def test_unit_normalization():
    assert normalize_energy(10, "MWh") == 10000.0
    assert normalize_mass_to_kg(5, "tonne") == 5000.0
    assert normalize_mass_to_kg(2500, "g") == 2.5

def test_carbon_calculation_logic(db_session):
    # Create test factory & assessment
    user_ind = db_session.query(Industry).first()
    assert user_ind is not None

    test_ass = Assessment(
        user_id=user_ind.user_id,
        industry_id=user_ind.id,
        name="Unit Test Assessment",
        status="draft"
    )
    db_session.add(test_ass)
    db_session.commit()
    db_session.refresh(test_ass)

    # 1,000 kWh Grid Electricity (factor = 0.716) -> 716 kg CO2e
    db_session.add(EnergyInput(
        assessment_id=test_ass.id,
        source_type="grid_electricity",
        quantity=1000.0,
        unit="kWh",
        renewable_percentage=0.0
    ))
    # 100 Litres Diesel (factor = 2.68) -> 268 kg CO2e
    db_session.add(EnergyInput(
        assessment_id=test_ass.id,
        source_type="diesel",
        quantity=100.0,
        unit="litre",
        renewable_percentage=0.0
    ))
    db_session.commit()

    engine_calc = CarbonCalculationEngine(db_session)
    res = engine_calc.calculate_assessment(test_ass.id)

    expected_total_kg = 716.0 + 268.0
    expected_total_t = expected_total_kg / 1000.0

    assert abs(res["total_emissions_tco2e"] - expected_total_t) < 0.05
    assert abs(res["scope1_tco2e"] - (268.0 / 1000.0)) < 0.05
    assert abs(res["scope2_tco2e"] - (716.0 / 1000.0)) < 0.05
