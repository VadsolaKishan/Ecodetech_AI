import numpy as np
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sklearn.ensemble import IsolationForest
from app.models.models import Assessment, EmissionResult, EmissionHotspot

class HotspotDetectionEngine:
    def __init__(self, db: Session):
        self.db = db

    def detect_and_rank_hotspots(self, assessment_id: int) -> List[EmissionHotspot]:
        assessment = self.db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError(f"Assessment {assessment_id} not found")

        results = self.db.query(EmissionResult).filter(EmissionResult.assessment_id == assessment_id).all()
        if not results:
            return []

        # Clear existing hotspots for this assessment
        self.db.query(EmissionHotspot).filter(EmissionHotspot.assessment_id == assessment_id).delete()

        total_emissions_kg = sum(r.emissions_kg_co2e for r in results)
        if total_emissions_kg <= 0:
            total_emissions_kg = 1.0 # prevent div zero

        # Run Isolation Forest anomaly detection if we have sufficient sources (>= 4)
        emissions_array = np.array([[r.emissions_kg_co2e] for r in results])
        anomalies = [False] * len(results)
        if len(results) >= 4:
            try:
                clf = IsolationForest(contamination=0.25, random_state=42)
                preds = clf.fit_predict(emissions_array)
                # In scikit-learn, -1 indicates outlier
                # Outlier with top magnitude is a statistical leak-point
                mean_val = np.mean(emissions_array)
                for idx, p in enumerate(preds):
                    if p == -1 and results[idx].emissions_kg_co2e > mean_val:
                        anomalies[idx] = True
            except Exception:
                pass

        created_hotspots = []
        for idx, r in enumerate(results):
            pct = (r.emissions_kg_co2e / total_emissions_kg) * 100.0
            
            # Severity classification
            if pct >= 30.0:
                severity = "Critical"
                reduction_potential_wt = 35.0
            elif pct >= 15.0:
                severity = "High"
                reduction_potential_wt = 25.0
            elif pct >= 5.0:
                severity = "Medium"
                reduction_potential_wt = 15.0
            else:
                severity = "Low"
                reduction_potential_wt = 5.0

            # Hotspot Score (0 - 100):
            # 50% from emission contribution
            # 30% reduction potential
            # 20% anomaly/economic leverage
            contrib_score = min(50.0, (pct / 60.0) * 50.0)
            leak_bonus = 15.0 if anomalies[idx] else 5.0
            total_hotspot_score = min(100.0, round(contrib_score + reduction_potential_wt + leak_bonus, 1))

            # Explainable natural-language explanation
            explanation = self._build_explanation(
                source_name=r.source_name,
                category=r.category,
                percentage=round(pct, 1),
                severity=severity,
                is_anomaly=anomalies[idx]
            )

            hotspot = EmissionHotspot(
                assessment_id=assessment_id,
                source_name=r.source_name,
                category=r.category,
                emissions_kg_co2e=round(r.emissions_kg_co2e, 2),
                percentage_contribution=round(pct, 1),
                severity=severity,
                hotspot_score=total_hotspot_score,
                anomaly_detected=anomalies[idx],
                explanation=explanation
            )
            self.db.add(hotspot)
            created_hotspots.append(hotspot)

        self.db.commit()

        # Sort by percentage contribution descending
        created_hotspots.sort(key=lambda h: h.percentage_contribution, reverse=True)
        return created_hotspots

    def _build_explanation(self, source_name: str, category: str, percentage: float, severity: str, is_anomaly: bool) -> str:
        leak_note = " Anomaly analysis flagged this as an abnormal high-intensity emission leak." if is_anomaly else ""
        if severity == "Critical":
            return f"{source_name} is your single largest carbon emission hotspot, generating {percentage}% of the facility's total footprint.{leak_note} Targeting this source provides the highest ROI decarbonization pathway."
        elif severity == "High":
            return f"{source_name} contributes {percentage}% to overall emissions (classified as High Priority).{leak_note} Process substitution or circular material recovery can eliminate a significant portion of this impact."
        elif severity == "Medium":
            return f"{source_name} accounts for {percentage}% of plant emissions (Medium Priority). Incremental efficiency gains and logistics optimization will yield consistent progress."
        else:
            return f"{source_name} accounts for {percentage}% of total footprint (Low Priority). Focus first on Critical and High hotspots before investing heavy capital here."
