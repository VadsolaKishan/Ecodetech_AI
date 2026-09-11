from sqlalchemy.orm import Session
from app.models.models import EmissionFactor

DEFAULT_EMISSION_FACTORS = [
    # Energy
    {
        "category": "energy",
        "activity": "grid_electricity",
        "unit": "kWh",
        "factor": 0.716, # CEA CO2 Baseline Database India
        "factor_unit": "kg CO2e/kWh",
        "source": "CEA India v19 / GHG Protocol",
        "region": "India National Grid",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "energy",
        "activity": "solar_onsite",
        "unit": "kWh",
        "factor": 0.041, # Lifecycle PV emissions
        "factor_unit": "kg CO2e/kWh",
        "source": "IPCC AR6 / NREL",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "energy",
        "activity": "diesel",
        "unit": "litre",
        "factor": 2.68,
        "factor_unit": "kg CO2e/L",
        "source": "IPCC / DEFRA",
        "region": "India",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "energy",
        "activity": "coal",
        "unit": "kg",
        "factor": 2.42,
        "factor_unit": "kg CO2e/kg",
        "source": "CEA India / IPCC",
        "region": "India Bituminous",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "energy",
        "activity": "natural_gas",
        "unit": "m3",
        "factor": 2.02,
        "factor_unit": "kg CO2e/m3",
        "source": "DEFRA / IPCC",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "energy",
        "activity": "lpg",
        "unit": "kg",
        "factor": 2.98,
        "factor_unit": "kg CO2e/kg",
        "source": "IPCC",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "energy",
        "activity": "biomass",
        "unit": "kg",
        "factor": 0.15,
        "factor_unit": "kg CO2e/kg",
        "source": "MNRE India / IPCC",
        "region": "India",
        "year": 2024,
        "confidence_level": "High"
    },

    # Materials
    {
        "category": "materials",
        "activity": "virgin_polyester",
        "unit": "kg",
        "factor": 5.50,
        "factor_unit": "kg CO2e/kg",
        "source": "Ecoinvent 3.9 / Higg MSI",
        "region": "Asia",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "materials",
        "activity": "recycled_polyester",
        "unit": "kg",
        "factor": 1.80,
        "factor_unit": "kg CO2e/kg",
        "source": "Ecoinvent / Textile Exchange",
        "region": "Asia",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "materials",
        "activity": "virgin_cotton",
        "unit": "kg",
        "factor": 4.20,
        "factor_unit": "kg CO2e/kg",
        "source": "Higg MSI",
        "region": "India",
        "year": 2024,
        "confidence_level": "Medium"
    },
    {
        "category": "materials",
        "activity": "recycled_cotton",
        "unit": "kg",
        "factor": 1.90,
        "factor_unit": "kg CO2e/kg",
        "source": "Higg MSI",
        "region": "Global",
        "year": 2024,
        "confidence_level": "Medium"
    },
    {
        "category": "materials",
        "activity": "virgin_plastics",
        "unit": "kg",
        "factor": 2.45,
        "factor_unit": "kg CO2e/kg",
        "source": "PlasticsEurope / DEFRA",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "materials",
        "activity": "recycled_plastics",
        "unit": "kg",
        "factor": 0.85,
        "factor_unit": "kg CO2e/kg",
        "source": "PlasticsEurope",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "materials",
        "activity": "virgin_steel",
        "unit": "kg",
        "factor": 1.89,
        "factor_unit": "kg CO2e/kg",
        "source": "WorldSteel Association",
        "region": "India / Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "materials",
        "activity": "recycled_steel",
        "unit": "kg",
        "factor": 0.45,
        "factor_unit": "kg CO2e/kg",
        "source": "WorldSteel Association",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "materials",
        "activity": "virgin_aluminum",
        "unit": "kg",
        "factor": 11.50,
        "factor_unit": "kg CO2e/kg",
        "source": "IAI (Intl Aluminium Inst)",
        "region": "India Coal-heavy smelter",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "materials",
        "activity": "recycled_aluminum",
        "unit": "kg",
        "factor": 0.95,
        "factor_unit": "kg CO2e/kg",
        "source": "IAI",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "materials",
        "activity": "virgin_paper",
        "unit": "kg",
        "factor": 0.95,
        "factor_unit": "kg CO2e/kg",
        "source": "DEFRA / CEPI",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "materials",
        "activity": "recycled_paper",
        "unit": "kg",
        "factor": 0.38,
        "factor_unit": "kg CO2e/kg",
        "source": "DEFRA / CEPI",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "materials",
        "activity": "general_chemicals",
        "unit": "kg",
        "factor": 2.10,
        "factor_unit": "kg CO2e/kg",
        "source": "Ecoinvent",
        "region": "Global",
        "year": 2024,
        "confidence_level": "Medium"
    },
    {
        "category": "materials",
        "activity": "cement_aggregate",
        "unit": "kg",
        "factor": 0.82,
        "factor_unit": "kg CO2e/kg",
        "source": "GCCA India",
        "region": "India",
        "year": 2024,
        "confidence_level": "High"
    },

    # Waste
    {
        "category": "waste",
        "activity": "landfill_waste",
        "unit": "kg",
        "factor": 0.58,
        "factor_unit": "kg CO2e/kg",
        "source": "DEFRA / IPCC Waste Model",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "waste",
        "activity": "incineration_waste",
        "unit": "kg",
        "factor": 0.42,
        "factor_unit": "kg CO2e/kg",
        "source": "DEFRA",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "waste",
        "activity": "composting_waste",
        "unit": "kg",
        "factor": 0.12,
        "factor_unit": "kg CO2e/kg",
        "source": "IPCC Tier 1",
        "region": "Global",
        "year": 2024,
        "confidence_level": "Medium"
    },
    {
        "category": "waste",
        "activity": "recycling_diversion",
        "unit": "kg",
        "factor": 0.05, # Sorting & transport overhead
        "factor_unit": "kg CO2e/kg",
        "source": "WRAP UK / DEFRA",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "waste",
        "activity": "byproduct_reuse",
        "unit": "kg",
        "factor": 0.02,
        "factor_unit": "kg CO2e/kg",
        "source": "Industrial Ecology Institute",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    },

    # Transportation
    {
        "category": "transport",
        "activity": "heavy_truck",
        "unit": "tonne-km",
        "factor": 0.115,
        "factor_unit": "kg CO2e/tonne-km",
        "source": "DEFRA Freight / GLEC Framework",
        "region": "India / Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "transport",
        "activity": "medium_truck",
        "unit": "tonne-km",
        "factor": 0.185,
        "factor_unit": "kg CO2e/tonne-km",
        "source": "DEFRA / GLEC",
        "region": "India / Global",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "transport",
        "activity": "rail_freight",
        "unit": "tonne-km",
        "factor": 0.028,
        "factor_unit": "kg CO2e/tonne-km",
        "source": "Indian Railways Electrified / GLEC",
        "region": "India",
        "year": 2024,
        "confidence_level": "High"
    },
    {
        "category": "transport",
        "activity": "electric_van",
        "unit": "tonne-km",
        "factor": 0.045,
        "factor_unit": "kg CO2e/tonne-km",
        "source": "GLEC Framework",
        "region": "Global",
        "year": 2024,
        "confidence_level": "High"
    }
]

def seed_emission_factors(db: Session):
    for item in DEFAULT_EMISSION_FACTORS:
        existing = db.query(EmissionFactor).filter(EmissionFactor.activity == item["activity"]).first()
        if not existing:
            factor = EmissionFactor(**item)
            db.add(factor)
    db.commit()
