from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import (
    Assessment, Industry, EnergyInput, MaterialInput, WasteInput, TransportInput, User
)
from app.schemas.schemas import AssessmentCreate, AssessmentOut, AssessmentFullDetail, ApiResponse
from app.api.deps import get_current_user
from app.services.carbon_calculator import CarbonCalculationEngine
from app.services.hotspot_detector import HotspotDetectionEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.circularity_score import CircularityScoringEngine

router = APIRouter()

@router.get("", response_model=ApiResponse)
def list_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessments = db.query(Assessment).filter(Assessment.user_id == current_user.id).order_by(Assessment.created_at.desc()).all()
    results = [AssessmentOut.from_orm(a).dict() for a in assessments]
    return ApiResponse(success=True, data=results)

@router.post("", response_model=ApiResponse)
def create_assessment(
    data: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    industry = db.query(Industry).filter(Industry.user_id == current_user.id).first()
    if not industry:
        industry = Industry(
            user_id=current_user.id,
            company_name="Factory Unit",
            industry_type="Manufacturing",
            factory_location="Industrial Area"
        )
        db.add(industry)
        db.commit()
        db.refresh(industry)

    if data.monthly_production:
        industry.monthly_production = data.monthly_production
    if data.production_unit:
        industry.production_unit = data.production_unit
    db.commit()

    assessment = Assessment(
        user_id=current_user.id,
        industry_id=industry.id,
        name=data.name or "Factory Carbon Audit",
        assessment_period=data.assessment_period or "Monthly 2026",
        status="draft"
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Add Energy Inputs
    for e in data.energy_inputs:
        db.add(EnergyInput(
            assessment_id=assessment.id,
            source_type=e.source_type,
            quantity=e.quantity,
            unit=e.unit,
            renewable_percentage=e.renewable_percentage,
            notes=e.notes
        ))

    # Add Material Inputs
    for m in data.material_inputs:
        db.add(MaterialInput(
            assessment_id=assessment.id,
            material_name=m.material_name,
            material_type=m.material_type,
            quantity=m.quantity,
            unit=m.unit,
            virgin_percentage=m.virgin_percentage,
            recycled_percentage=m.recycled_percentage,
            supplier_distance_km=m.supplier_distance_km
        ))

    # Add Waste Inputs
    for w in data.waste_inputs:
        db.add(WasteInput(
            assessment_id=assessment.id,
            waste_type=w.waste_type,
            quantity=w.quantity,
            unit=w.unit,
            disposal_method=w.disposal_method,
            recyclable_percentage=w.recyclable_percentage,
            current_treatment=w.current_treatment
        ))

    # Add Transport Inputs
    for t in data.transport_inputs:
        db.add(TransportInput(
            assessment_id=assessment.id,
            transport_mode=t.transport_mode,
            distance_km=t.distance_km,
            weight_tonnes=t.weight_tonnes,
            frequency_per_month=t.frequency_per_month
        ))

    db.commit()

    # Automatically trigger calculations, hotspot detection, and circular recommendation engine
    calc_engine = CarbonCalculationEngine(db)
    hotspot_engine = HotspotDetectionEngine(db)
    rec_engine = RecommendationEngine(db)
    circ_engine = CircularityScoringEngine(db)

    calc_engine.calculate_assessment(assessment.id)
    hotspot_engine.detect_and_rank_hotspots(assessment.id)
    rec_engine.generate_recommendations(assessment.id)
    circ_engine.calculate_circularity_score(assessment.id)

    db.refresh(assessment)
    return ApiResponse(
        success=True,
        message="Assessment created and AI carbon analysis completed",
        data=AssessmentOut.from_orm(assessment).dict()
    )

@router.get("/{assessment_id}", response_model=ApiResponse)
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    detail = AssessmentFullDetail.from_orm(assessment).dict()
    # Add input details
    detail["energy_inputs"] = [{"source_type": e.source_type, "quantity": e.quantity, "unit": e.unit, "renewable_percentage": e.renewable_percentage} for e in assessment.energy_inputs]
    detail["material_inputs"] = [{"material_name": m.material_name, "material_type": m.material_type, "quantity": m.quantity, "unit": m.unit, "virgin_percentage": m.virgin_percentage, "recycled_percentage": m.recycled_percentage} for m in assessment.material_inputs]
    detail["waste_inputs"] = [{"waste_type": w.waste_type, "quantity": w.quantity, "unit": w.unit, "disposal_method": w.disposal_method, "recyclable_percentage": w.recyclable_percentage} for w in assessment.waste_inputs]
    detail["transport_inputs"] = [{"transport_mode": t.transport_mode, "distance_km": t.distance_km, "weight_tonnes": t.weight_tonnes, "frequency_per_month": t.frequency_per_month} for t in assessment.transport_inputs]

    return ApiResponse(success=True, data=detail)

@router.delete("/{assessment_id}", response_model=ApiResponse)
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(assessment)
    db.commit()
    return ApiResponse(success=True, message="Assessment deleted successfully")
