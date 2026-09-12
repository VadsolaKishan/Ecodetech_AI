from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Standard API response format
class ApiResponse(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[Dict[str, Any]] = None

# User & Auth
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: Optional[str] = "factory_operator"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str = Field(..., min_length=6)

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Industry Profile
class IndustryBase(BaseModel):
    company_name: str
    industry_type: str
    factory_location: str
    production_type: Optional[str] = "General"
    monthly_production: float = 0.0
    production_unit: str = "tonnes"
    number_of_employees: int = 50
    operating_hours_per_day: float = 16.0
    main_energy_sources: Optional[str] = "Grid electricity, Diesel"
    main_raw_materials: Optional[str] = "Virgin raw materials"
    main_waste_types: Optional[str] = "Process waste, packaging"

class IndustryCreate(IndustryBase):
    pass

class IndustryUpdate(IndustryBase):
    pass

class IndustryOut(IndustryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Inputs
class EnergyInputItem(BaseModel):
    source_type: str # grid_electricity, solar_onsite, coal, diesel, natural_gas, biomass, lpg
    quantity: float
    unit: str # kWh, MWh, litre, kg, tonne, m3
    renewable_percentage: float = 0.0
    notes: Optional[str] = None

class MaterialInputItem(BaseModel):
    material_name: str
    material_type: str # Metals, Plastics/Polymers, Textiles/Fibers, Paper/Cardboard, Chemicals, Minerals/Aggregates, Other
    quantity: float
    unit: str = "tonne"
    virgin_percentage: float = 100.0
    recycled_percentage: float = 0.0
    supplier_distance_km: float = 100.0
    notes: Optional[str] = None

class WasteInputItem(BaseModel):
    waste_type: str # Organic, Plastic/Packaging, Ash/Slag, Hazardous, Scrap Metal, General Mixed
    quantity: float
    unit: str = "tonne"
    disposal_method: str = "landfill" # landfill, recycling, composting, incineration, byproduct_reuse
    recyclable_percentage: float = 0.0
    current_treatment: Optional[str] = None
    notes: Optional[str] = None

class TransportInputItem(BaseModel):
    transport_mode: str = "heavy_truck" # heavy_truck, medium_truck, rail, electric_van
    distance_km: float
    weight_tonnes: float
    frequency_per_month: int = 1

# Assessment
class AssessmentCreate(BaseModel):
    name: Optional[str] = "Factory Carbon Assessment"
    assessment_period: Optional[str] = "Monthly 2026"
    energy_inputs: List[EnergyInputItem] = []
    material_inputs: List[MaterialInputItem] = []
    waste_inputs: List[WasteInputItem] = []
    transport_inputs: List[TransportInputItem] = []
    monthly_production: Optional[float] = None
    production_unit: Optional[str] = None

class EmissionResultOut(BaseModel):
    id: int
    category: str
    source_name: str
    activity_value: float
    activity_unit: str
    emission_factor_used: float
    emissions_kg_co2e: float
    scope: str

    class Config:
        from_attributes = True

class HotspotOut(BaseModel):
    id: int
    source_name: str
    category: str
    emissions_kg_co2e: float
    percentage_contribution: float
    severity: str
    hotspot_score: float
    anomaly_detected: bool
    explanation: str

    class Config:
        from_attributes = True

class RecommendationOut(BaseModel):
    id: int
    assessment_id: Optional[int] = None
    recommendation_key: str
    title: str
    category: str
    target_emission_source: str
    reason: str
    estimated_co2_reduction_kg: float
    reduction_percentage: float
    implementation_cost_inr: float
    annual_savings_inr: float
    payback_months: float
    feasibility: str
    priority_rank: int
    confidence: str
    circularity_boost: float
    assumptions: Optional[str] = None

    class Config:
        from_attributes = True

class AssessmentOut(BaseModel):
    id: int
    name: str
    assessment_period: str
    status: str
    total_emissions_tco2e: float
    scope1_tco2e: float
    scope2_tco2e: float
    scope3_tco2e: float
    emission_intensity: float
    circularity_score: float
    potential_reduction_tco2e: float
    potential_savings_inr: float
    confidence_level: str
    created_at: datetime

    class Config:
        from_attributes = True

class AssessmentFullDetail(AssessmentOut):
    industry: Optional[IndustryOut] = None
    emission_results: List[EmissionResultOut] = []
    hotspots: List[HotspotOut] = []
    recommendations: List[RecommendationOut] = []

# Simulator
class SimulatorInput(BaseModel):
    solar_percentage: float = Field(0.0, ge=0.0, le=100.0)
    recycled_material_percentage: float = Field(0.0, ge=0.0, le=100.0)
    waste_recovery_percentage: float = Field(0.0, ge=0.0, le=100.0)
    transport_reduction_percentage: float = Field(0.0, ge=0.0, le=100.0)

class SimulatorResult(BaseModel):
    baseline_co2e_t: float
    simulated_co2e_t: float
    avoided_co2e_t: float
    reduction_percentage: float
    estimated_capex_inr: float
    estimated_annual_savings_inr: float
    payback_months: float
    new_circularity_score: float
    baseline_circularity_score: float
    circularity_delta: float
    breakdown: Dict[str, float]
    summary_message: str

class ScenarioCreate(SimulatorInput):
    name: str
    description: Optional[str] = None

class ScenarioOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    solar_percentage: float
    recycled_material_percentage: float
    waste_recovery_percentage: float
    transport_reduction_percentage: float
    result_co2e_tonnes: float
    reduction_percentage: float
    cost_estimate_inr: float
    annual_savings_inr: float
    payback_months: float
    circularity_score: float
    is_recommended: bool

    class Config:
        from_attributes = True

# Action Plan
class ActionPlanCreate(BaseModel):
    recommendation_id: Optional[int] = None
    title: str
    category: str = "Energy"
    priority: str = "High"
    owner: str = "Plant Operations"
    deadline: str = "Q3 2026"
    estimated_cost_inr: float = 0.0
    expected_co2_reduction_kg: float = 0.0
    status: str = "Planned"

class ActionPlanUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[str] = None
    owner: Optional[str] = None
    deadline: Optional[str] = None
    estimated_cost_inr: Optional[float] = None
    expected_co2_reduction_kg: Optional[float] = None
    status: Optional[str] = None

class ActionPlanOut(BaseModel):
    id: int
    assessment_id: int
    recommendation_id: Optional[int]
    title: str
    category: str
    priority: str
    owner: str
    deadline: str
    estimated_cost_inr: float
    expected_co2_reduction_kg: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# AI Assistant
class ChatQuery(BaseModel):
    assessment_id: Optional[int] = None
    message: str
    history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    response: str
    context_used: Dict[str, Any] = {}
    model_used: Optional[str] = None
    is_llm_active: bool = False

# Bill OCR & Smart Ingest
class BillOcrSampleRequest(BaseModel):
    sample_type: str = "electricity_torrent" # electricity_torrent, fuel_diesel_iocl, material_cotton

class SuggestedInputItem(BaseModel):
    target_step: str = "energy" # energy, material, waste
    source_type: Optional[str] = None
    material_name: Optional[str] = None
    material_type: Optional[str] = None
    waste_type: Optional[str] = None
    quantity: float = 0.0
    unit: str = "kWh"
    renewable_percentage: float = 0.0
    virgin_percentage: float = 100.0
    recycled_percentage: float = 0.0
    supplier_distance_km: float = 0.0
    notes: Optional[str] = None

class BillOcrResult(BaseModel):
    document_type: str
    vendor_or_utility: Optional[str] = None
    consumer_or_invoice_no: Optional[str] = None
    billing_period: Optional[str] = None
    total_amount_inr: Optional[float] = None
    confidence_score: float = 0.95
    extracted_metrics: Dict[str, Any] = {}
    suggested_inputs: List[SuggestedInputItem] = []
    summary: str
    engine_used: Optional[str] = None
    is_sample_demo: bool = False
