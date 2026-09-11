from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Assessment, Scenario, User
from app.schemas.schemas import SimulatorInput, SimulatorResult, ScenarioCreate, ScenarioOut, ApiResponse
from app.api.deps import get_current_user
from app.services.simulator_service import SimulatorService

router = APIRouter()

@router.post("/calculate", response_model=ApiResponse)
def simulate_impact(
    sim_input: SimulatorInput,
    assessment_id: int = Query(..., description="ID of the assessment to simulate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SimulatorService(db)
    try:
        result = service.simulate(
            assessment_id=assessment_id,
            solar_pct=sim_input.solar_percentage,
            recycled_pct=sim_input.recycled_material_percentage,
            waste_rec_pct=sim_input.waste_recovery_percentage,
            transport_red_pct=sim_input.transport_reduction_percentage
        )
        return ApiResponse(success=True, data=result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/compare/{assessment_id}", response_model=ApiResponse)
def get_preset_scenarios(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SimulatorService(db)
    try:
        scenarios = service.generate_preset_scenarios(assessment_id)
        return ApiResponse(success=True, data=scenarios)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/scenario", response_model=ApiResponse)
def save_scenario(
    scen_in: ScenarioCreate,
    assessment_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SimulatorService(db)
    sim = service.simulate(
        assessment_id=assessment_id,
        solar_pct=scen_in.solar_percentage,
        recycled_pct=scen_in.recycled_material_percentage,
        waste_rec_pct=scen_in.waste_recovery_percentage,
        transport_red_pct=scen_in.transport_reduction_percentage
    )
    scen = Scenario(
        assessment_id=assessment_id,
        name=scen_in.name,
        description=scen_in.description,
        solar_percentage=scen_in.solar_percentage,
        recycled_material_percentage=scen_in.recycled_material_percentage,
        waste_recovery_percentage=scen_in.waste_recovery_percentage,
        transport_reduction_percentage=scen_in.transport_reduction_percentage,
        result_co2e_tonnes=sim["simulated_co2e_t"],
        reduction_percentage=sim["reduction_percentage"],
        cost_estimate_inr=sim["estimated_capex_inr"],
        annual_savings_inr=sim["estimated_annual_savings_inr"],
        payback_months=sim["payback_months"],
        circularity_score=sim["new_circularity_score"],
        is_recommended=False
    )
    db.add(scen)
    db.commit()
    db.refresh(scen)
    return ApiResponse(success=True, message="Scenario saved successfully", data=ScenarioOut.from_orm(scen).dict())
