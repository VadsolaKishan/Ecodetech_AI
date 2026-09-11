from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import (
    Assessment, EnergyInput, MaterialInput, WasteInput, TransportInput,
    EmissionFactor, EmissionResult
)

# Standard unit normalizations
def normalize_energy(quantity: float, unit: str) -> float:
    u = unit.lower().strip()
    if u in ["mwh"]:
        return quantity * 1000.0 # to kWh
    elif u in ["gj"]:
        return quantity * 277.778 # to kWh
    return quantity

def normalize_mass_to_kg(quantity: float, unit: str) -> float:
    u = unit.lower().strip()
    if u in ["tonne", "tonnes", "t", "metric tonne"]:
        return quantity * 1000.0
    elif u in ["gram", "g"]:
        return quantity / 1000.0
    return quantity

def normalize_mass_to_tonnes(quantity: float, unit: str) -> float:
    u = unit.lower().strip()
    if u in ["kg", "kilogram"]:
        return quantity / 1000.0
    return quantity

def map_material_to_activity(material_type: str, material_name: str, is_recycled: bool) -> str:
    name_lower = f"{material_type} {material_name}".lower()
    if "polyester" in name_lower or "synthetic" in name_lower:
        return "recycled_polyester" if is_recycled else "virgin_polyester"
    elif "cotton" in name_lower or "yarn" in name_lower or "textile" in name_lower:
        return "recycled_cotton" if is_recycled else "virgin_cotton"
    elif "steel" in name_lower or "iron" in name_lower:
        return "recycled_steel" if is_recycled else "virgin_steel"
    elif "aluminum" in name_lower or "aluminium" in name_lower:
        return "recycled_aluminum" if is_recycled else "virgin_aluminum"
    elif "paper" in name_lower or "cardboard" in name_lower or "packaging" in name_lower:
        return "recycled_paper" if is_recycled else "virgin_paper"
    elif "plastic" in name_lower or "polymer" in name_lower or "pet" in name_lower or "hdpe" in name_lower or "ldpe" in name_lower:
        return "recycled_plastics" if is_recycled else "virgin_plastics"
    elif "cement" in name_lower or "clinker" in name_lower:
        return "cement_aggregate"
    elif "chemical" in name_lower:
        return "general_chemicals"
    return "recycled_plastics" if is_recycled else "virgin_plastics"

def map_waste_to_activity(disposal_method: str) -> str:
    method = disposal_method.lower().strip()
    if "recycl" in method:
        return "recycling_diversion"
    elif "compost" in method or "bio" in method:
        return "composting_waste"
    elif "incinerat" in method or "burn" in method:
        return "incineration_waste"
    elif "byproduct" in method or "reuse" in method or "symbiosis" in method:
        return "byproduct_reuse"
    return "landfill_waste"

class CarbonCalculationEngine:
    def __init__(self, db: Session):
        self.db = db
        # Pre-load emission factors
        factors = db.query(EmissionFactor).all()
        self.factor_map = {f.activity: f for f in factors}

    def get_factor(self, activity: str, default_val: float = 1.0) -> Tuple[float, str]:
        if activity in self.factor_map:
            return self.factor_map[activity].factor, self.factor_map[activity].source
        return default_val, "Estimation standard"

    def calculate_assessment(self, assessment_id: int) -> Dict[str, Any]:
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError(f"Assessment {assessment_id} not found")

        # Clear existing detailed results
        self.db.query(EmissionResult).filter(EmissionResult.assessment_id == assessment_id).delete()

        scope1_kg = 0.0
        scope2_kg = 0.0
        scope3_kg = 0.0

        results_to_insert = []

        # 1. Process Energy Inputs
        for e in assessment.energy_inputs:
            st = e.source_type.lower().strip()
            norm_qty = normalize_energy(e.quantity, e.unit)
            
            # Check if grid electricity (Scope 2)
            if "grid" in st or "electricity" in st:
                # Deduct renewable % if on green tariff
                grid_share = max(0.0, 1.0 - (e.renewable_percentage / 100.0))
                effective_kwh = norm_qty * grid_share
                factor, src = self.get_factor("grid_electricity", 0.716)
                emissions_kg = effective_kwh * factor
                scope2_kg += emissions_kg
                
                results_to_insert.append(EmissionResult(
                    assessment_id=assessment_id,
                    category="Energy",
                    source_name="Grid Electricity",
                    activity_value=round(norm_qty, 2),
                    activity_unit="kWh",
                    emission_factor_used=factor,
                    emissions_kg_co2e=round(emissions_kg, 2),
                    scope="Scope 2"
                ))

                if e.renewable_percentage > 0:
                    solar_kwh = norm_qty * (e.renewable_percentage / 100.0)
                    solar_factor, _ = self.get_factor("solar_onsite", 0.041)
                    solar_emissions = solar_kwh * solar_factor
                    scope2_kg += solar_emissions
                    results_to_insert.append(EmissionResult(
                        assessment_id=assessment_id,
                        category="Energy",
                        source_name="Renewable Solar Energy",
                        activity_value=round(solar_kwh, 2),
                        activity_unit="kWh",
                        emission_factor_used=solar_factor,
                        emissions_kg_co2e=round(solar_emissions, 2),
                        scope="Scope 2"
                    ))

            elif "coal" in st:
                norm_coal_kg = normalize_mass_to_kg(e.quantity, e.unit)
                factor, _ = self.get_factor("coal", 2.42)
                emissions_kg = norm_coal_kg * factor
                scope1_kg += emissions_kg
                results_to_insert.append(EmissionResult(
                    assessment_id=assessment_id,
                    category="Energy",
                    source_name="Boiler Coal Combustion",
                    activity_value=round(norm_coal_kg, 2),
                    activity_unit="kg",
                    emission_factor_used=factor,
                    emissions_kg_co2e=round(emissions_kg, 2),
                    scope="Scope 1"
                ))

            elif "diesel" in st or "genset" in st:
                factor, _ = self.get_factor("diesel", 2.68)
                emissions_kg = e.quantity * factor
                scope1_kg += emissions_kg
                results_to_insert.append(EmissionResult(
                    assessment_id=assessment_id,
                    category="Energy",
                    source_name="Diesel Generators (DG Sets)",
                    activity_value=round(e.quantity, 2),
                    activity_unit=e.unit,
                    emission_factor_used=factor,
                    emissions_kg_co2e=round(emissions_kg, 2),
                    scope="Scope 1"
                ))

            elif "gas" in st or "natural" in st:
                factor, _ = self.get_factor("natural_gas", 2.02)
                emissions_kg = e.quantity * factor
                scope1_kg += emissions_kg
                results_to_insert.append(EmissionResult(
                    assessment_id=assessment_id,
                    category="Energy",
                    source_name="Natural Gas Combustion",
                    activity_value=round(e.quantity, 2),
                    activity_unit=e.unit,
                    emission_factor_used=factor,
                    emissions_kg_co2e=round(emissions_kg, 2),
                    scope="Scope 1"
                ))

            elif "biomass" in st:
                norm_bio_kg = normalize_mass_to_kg(e.quantity, e.unit)
                factor, _ = self.get_factor("biomass", 0.15)
                emissions_kg = norm_bio_kg * factor
                scope1_kg += emissions_kg
                results_to_insert.append(EmissionResult(
                    assessment_id=assessment_id,
                    category="Energy",
                    source_name="Biomass Boiler Fuel",
                    activity_value=round(norm_bio_kg, 2),
                    activity_unit="kg",
                    emission_factor_used=factor,
                    emissions_kg_co2e=round(emissions_kg, 2),
                    scope="Scope 1"
                ))

        # 2. Process Raw Materials (Scope 3 Category 1 - Purchased Goods)
        for m in assessment.material_inputs:
            mass_kg = normalize_mass_to_kg(m.quantity, m.unit)
            virgin_ratio = max(0.0, m.virgin_percentage / 100.0)
            recycled_ratio = max(0.0, m.recycled_percentage / 100.0)

            if virgin_ratio > 0:
                v_activity = map_material_to_activity(m.material_type, m.material_name, is_recycled=False)
                v_factor, _ = self.get_factor(v_activity, 2.5)
                v_kg = mass_kg * virgin_ratio
                v_emissions = v_kg * v_factor
                scope3_kg += v_emissions
                results_to_insert.append(EmissionResult(
                    assessment_id=assessment_id,
                    category="Materials",
                    source_name=f"Virgin {m.material_name} ({m.material_type})",
                    activity_value=round(v_kg, 2),
                    activity_unit="kg",
                    emission_factor_used=v_factor,
                    emissions_kg_co2e=round(v_emissions, 2),
                    scope="Scope 3"
                ))

            if recycled_ratio > 0:
                r_activity = map_material_to_activity(m.material_type, m.material_name, is_recycled=True)
                r_factor, _ = self.get_factor(r_activity, 0.9)
                r_kg = mass_kg * recycled_ratio
                r_emissions = r_kg * r_factor
                scope3_kg += r_emissions
                results_to_insert.append(EmissionResult(
                    assessment_id=assessment_id,
                    category="Materials",
                    source_name=f"Recycled {m.material_name}",
                    activity_value=round(r_kg, 2),
                    activity_unit="kg",
                    emission_factor_used=r_factor,
                    emissions_kg_co2e=round(r_emissions, 2),
                    scope="Scope 3"
                ))

        # 3. Process Waste Streams (Scope 3 Category 5 - Waste Generated in Operations)
        for w in assessment.waste_inputs:
            mass_kg = normalize_mass_to_kg(w.quantity, w.unit)
            activity_key = map_waste_to_activity(w.disposal_method)
            factor, _ = self.get_factor(activity_key, 0.58)
            emissions_kg = mass_kg * factor
            scope3_kg += emissions_kg
            results_to_insert.append(EmissionResult(
                assessment_id=assessment_id,
                category="Waste",
                source_name=f"{w.waste_type} ({w.disposal_method.title()})",
                activity_value=round(mass_kg, 2),
                activity_unit="kg",
                emission_factor_used=factor,
                emissions_kg_co2e=round(emissions_kg, 2),
                scope="Scope 3"
            ))

        # 4. Process Transportation (Scope 3 Category 4 - Upstream / Downstream Transport)
        for t in assessment.transport_inputs:
            mode = t.transport_mode.lower().strip()
            # calculate tonne-km
            weight_t = t.weight_tonnes
            dist_km = t.distance_km
            freq = max(1, t.frequency_per_month)
            total_tonne_km = weight_t * dist_km * freq

            if "heavy" in mode:
                factor, _ = self.get_factor("heavy_truck", 0.115)
                source_label = "Heavy Logistics Trucks (>20t)"
            elif "rail" in mode:
                factor, _ = self.get_factor("rail_freight", 0.028)
                source_label = "Electrified Rail Freight"
            elif "electric" in mode:
                factor, _ = self.get_factor("electric_van", 0.045)
                source_label = "Electric Commercial Fleet"
            else:
                factor, _ = self.get_factor("medium_truck", 0.185)
                source_label = "Medium Freight Trucks"

            emissions_kg = total_tonne_km * factor
            scope3_kg += emissions_kg
            results_to_insert.append(EmissionResult(
                assessment_id=assessment_id,
                category="Transport",
                source_name=source_label,
                activity_value=round(total_tonne_km, 2),
                activity_unit="tonne-km",
                emission_factor_used=factor,
                emissions_kg_co2e=round(emissions_kg, 2),
                scope="Scope 3"
            ))

        # Commit Emission Results
        self.db.bulk_save_objects(results_to_insert)
        self.db.commit()

        # Update Assessment Total Rollup
        total_kg = scope1_kg + scope2_kg + scope3_kg
        total_tco2e = total_kg / 1000.0
        scope1_t = scope1_kg / 1000.0
        scope2_t = scope2_kg / 1000.0
        scope3_t = scope3_kg / 1000.0

        # Production intensity
        monthly_prod = assessment.industry.monthly_production if assessment.industry else 100.0
        if monthly_prod <= 0:
            monthly_prod = 100.0
        intensity = round(total_kg / monthly_prod, 2)

        assessment.total_emissions_tco2e = round(total_tco2e, 2)
        assessment.scope1_tco2e = round(scope1_t, 2)
        assessment.scope2_tco2e = round(scope2_t, 2)
        assessment.scope3_tco2e = round(scope3_t, 2)
        assessment.emission_intensity = intensity
        assessment.status = "calculated"
        self.db.commit()

        return {
            "total_emissions_tco2e": round(total_tco2e, 2),
            "scope1_tco2e": round(scope1_t, 2),
            "scope2_tco2e": round(scope2_t, 2),
            "scope3_tco2e": round(scope3_t, 2),
            "emission_intensity": intensity
        }
