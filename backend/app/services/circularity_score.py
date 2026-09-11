from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Assessment

class CircularityScoringEngine:
    def __init__(self, db: Session):
        self.db = db

    def calculate_circularity_score(self, assessment_id: int) -> Dict[str, Any]:
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError(f"Assessment {assessment_id} not found")

        # 1. Renewable Energy Component (Max 25 pts)
        total_energy_units = 0.0
        renewable_units = 0.0
        for e in assessment.energy_inputs:
            total_energy_units += e.quantity
            renewable_units += (e.quantity * (e.renewable_percentage / 100.0))
        energy_ratio = (renewable_units / total_energy_units) if total_energy_units > 0 else 0.0
        energy_pts = min(25.0, round(energy_ratio * 25.0, 1))

        # 2. Recycled Feedstock Ratio (Max 30 pts)
        total_material_mass = 0.0
        recycled_mass = 0.0
        for m in assessment.material_inputs:
            total_material_mass += m.quantity
            recycled_mass += (m.quantity * (m.recycled_percentage / 100.0))
        material_ratio = (recycled_mass / total_material_mass) if total_material_mass > 0 else 0.0
        material_pts = min(30.0, round(material_ratio * 30.0, 1))

        # 3. Waste Diversion & Upcycling Rate (Max 30 pts)
        total_waste_mass = 0.0
        diverted_waste_mass = 0.0
        for w in assessment.waste_inputs:
            total_waste_mass += w.quantity
            method = w.disposal_method.lower()
            if any(k in method for k in ["recycl", "compost", "byproduct", "reuse", "symbiosis"]):
                diverted_waste_mass += w.quantity
            elif w.recyclable_percentage > 0:
                diverted_waste_mass += (w.quantity * (w.recyclable_percentage / 100.0))
        waste_ratio = (diverted_waste_mass / total_waste_mass) if total_waste_mass > 0 else 0.0
        waste_pts = min(30.0, round(waste_ratio * 30.0, 1))

        # 4. Logistics & Local Sourcing Optimization (Max 15 pts)
        # Avg supplier distance & rail/EV mode bonus
        avg_dist = 100.0
        if assessment.material_inputs:
            avg_dist = sum(getattr(m, 'supplier_distance_km', 100.0) for m in assessment.material_inputs) / len(assessment.material_inputs)
        dist_score = max(0.0, 10.0 - (avg_dist / 100.0) * 5.0) # closer suppliers get up to 10 pts

        mode_bonus = 0.0
        for t in assessment.transport_inputs:
            if "rail" in t.transport_mode.lower() or "electric" in t.transport_mode.lower():
                mode_bonus = 5.0
                break
        transport_pts = min(15.0, round(dist_score + mode_bonus, 1))

        total_score = round(energy_pts + material_pts + waste_pts + transport_pts, 1)
        total_score = max(10.0, min(100.0, total_score)) # Baseline floor of 10

        assessment.circularity_score = total_score
        self.db.commit()

        breakdown = {
            "total_score": total_score,
            "renewable_energy_points": energy_pts,
            "recycled_feedstock_points": material_pts,
            "waste_diversion_points": waste_pts,
            "logistics_points": transport_pts,
            "max_possible": 100.0,
            "rating": "Advanced Circular" if total_score >= 70 else ("Emerging Circular" if total_score >= 40 else "Linear Economy Risk"),
            "methodology": "EcoDetect Circularity Index: Weighted synthesis of Energy Transition (25%), Feedstock Circularity (30%), Waste Divergence (30%), and Supply Chain Locality (15%)."
        }
        return breakdown
