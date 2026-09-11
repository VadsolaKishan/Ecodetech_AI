from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Assessment, Scenario, User
from app.schemas.schemas import SimulatorInput, SimulatorResult, ScenarioCreate, ScenarioOut, ApiResponse
from app.core.roles import UserRole, AuditEvent
from app.api.deps import get_current_user, require_roles, verify_assessment_access
from app.services.simulator_service import SimulatorService
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.post("/calculate", response_model=ApiResponse)
def simulate_impact(
    sim_input: SimulatorInput,
    assessment_id: int = Query(..., description="ID of the assessment to simulate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_assessment_access(db, current_user, assessment_id, read_only=True)
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
    verify_assessment_access(db, current_user, assessment_id, read_only=True)
    service = SimulatorService(db)
    try:
        scenarios = service.generate_preset_scenarios(assessment_id)
        return ApiResponse(success=True, data=scenarios)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/scenario", response_model=ApiResponse)
def save_scenario(
    scen_in: ScenarioCreate,
    request: Request,
    assessment_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.SUSTAINABILITY_CONSULTANT, UserRole.ADMIN))
):
    # Enforce write access: Regulator is blocked
    assessment = verify_assessment_access(db, current_user, assessment_id, read_only=False)

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
        result_co2e_tonnes=sim.get("simulated_co2e_t") or sim.get("projected_emissions_tco2e", 0.0),
        reduction_percentage=sim.get("reduction_percentage", 0.0),
        cost_estimate_inr=sim.get("estimated_capex_inr") or sim.get("capex_estimate_inr", 0.0),
        annual_savings_inr=sim.get("estimated_annual_savings_inr") or sim.get("annual_savings_inr", 0.0),
        payback_months=sim.get("payback_months", 0.0),
        circularity_score=sim.get("new_circularity_score") or sim.get("projected_circularity_score", 0.0),
        is_recommended=sim.get("reduction_percentage", 0.0) > 25.0
    )
    db.add(scen)
    db.commit()
    db.refresh(scen)

    log_audit_event(
        db, action=AuditEvent.SCENARIO_CREATED, entity_type="SCENARIO",
        user=current_user, entity_id=scen.id, factory_id=assessment.industry_id,
        details={"name": scen.name, "co2_cut_pct": scen.reduction_percentage},
        request=request
    )

    return ApiResponse(
        success=True,
        message="Scenario successfully saved to comparison roadmap",
        data=ScenarioOut.from_orm(scen).dict()
    )
