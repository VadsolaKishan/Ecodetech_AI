from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Assessment, Scenario, User
from app.schemas.schemas import SimulatorInput, SimulatorResult, ScenarioCreate, ScenarioOut, ApiResponse
from app.core.roles import UserRole, AuditEvent
from app.api.deps import get_current_user, require_roles, verify_assessment_access, resolve_accessible_assessment
from app.services.simulator_service import SimulatorService
from app.services.audit_service import log_audit_event
from app.core.cache import api_cache

router = APIRouter()

@router.post("/calculate", response_model=ApiResponse)
def simulate_impact(
    sim_input: SimulatorInput,
    assessment_id: int = Query(..., description="ID of the assessment to simulate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = resolve_accessible_assessment(db, current_user, assessment_id)
    if not assessment:
        return ApiResponse(success=True, data={
            "baseline_emissions_tco2e": 0,
            "projected_emissions_tco2e": 0,
            "total_reduction_tco2e": 0,
            "reduction_percentage": 0,
            "annual_cost_savings_inr": 0,
            "estimated_investment_inr": 0,
            "simple_payback_years": 0,
            "new_circularity_score": 0,
            "breakdown": []
        })

    service = SimulatorService(db)
    try:
        result = service.simulate(
            assessment_id=assessment.id,
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
    assessment = resolve_accessible_assessment(db, current_user, assessment_id)
    if not assessment:
        return ApiResponse(success=True, data=[])

    actual_id = assessment.id
    cache_key = f"scenarios_compare_{actual_id}"
    cached = api_cache.get(cache_key)
    if cached:
        return ApiResponse(success=True, data=cached)

    service = SimulatorService(db)
    try:
        preset_scenarios = service.generate_preset_scenarios(actual_id)
        for idx, ps in enumerate(preset_scenarios):
            if "id" not in ps:
                ps["id"] = -(idx + 1)

        # Retrieve user-saved custom scenarios from the database
        custom_scenarios = db.query(Scenario).filter(Scenario.assessment_id == actual_id).order_by(Scenario.id.desc()).all()
        custom_list = [ScenarioOut.from_orm(s).dict() for s in custom_scenarios]

        # Put custom saved scenarios first, followed by presets
        all_scenarios = custom_list + preset_scenarios
        api_cache.set(cache_key, all_scenarios, ttl=120, tags=[f"assessment_{actual_id}"])
        return ApiResponse(success=True, data=all_scenarios)
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
    assessment = resolve_accessible_assessment(db, current_user, assessment_id, read_only=False)
    if not assessment:
        raise HTTPException(status_code=404, detail="No active assessment found to attach scenario")

    actual_id = assessment.id
    service = SimulatorService(db)
    sim = service.simulate(
        assessment_id=actual_id,
        solar_pct=scen_in.solar_percentage,
        recycled_pct=scen_in.recycled_material_percentage,
        waste_rec_pct=scen_in.waste_recovery_percentage,
        transport_red_pct=scen_in.transport_reduction_percentage
    )
    scen = Scenario(
        assessment_id=actual_id,
        name=scen_in.name,
        description=scen_in.description or f"{scen_in.solar_percentage}% Solar, {scen_in.recycled_material_percentage}% Recycled Feedstock",
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

    api_cache.invalidate_by_tag(f"assessment_{actual_id}")

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
