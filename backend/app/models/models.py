import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

# 1. ROLES
class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False) # factory_owner, sustainability_consultant, regulator_auditor, admin
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 2. USERS
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", use_alter=True, name="fk_user_role"), nullable=True)
    role = Column(String(50), default="factory_owner") # factory_owner, sustainability_consultant, regulator_auditor, admin
    is_active = Column(Boolean, default=True)
    industry_id = Column(Integer, ForeignKey("industries.id", use_alter=True, name="fk_user_industry"), nullable=True)
    factory_id = Column(Integer, ForeignKey("factories.id", use_alter=True, name="fk_user_factory"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    role_rel = relationship("Role", foreign_keys=[role_id])
    industries = relationship("Industry", back_populates="owner", foreign_keys="Industry.user_id", cascade="all, delete-orphan")
    factories = relationship("Factory", back_populates="owner", foreign_keys="Factory.owner_id", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    action_plans = relationship("ActionPlan", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    factory_assignments = relationship("FactoryAssignment", back_populates="user", foreign_keys="FactoryAssignment.user_id", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")

# 3. INDUSTRIES
class Industry(Base):
    __tablename__ = "industries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String(255), nullable=False)
    industry_type = Column(String(100), nullable=False)
    factory_location = Column(String(255), nullable=False)
    production_type = Column(String(255), nullable=True)
    monthly_production = Column(Float, default=0.0)
    production_unit = Column(String(50), default="tonnes")
    number_of_employees = Column(Integer, default=50)
    operating_hours_per_day = Column(Float, default=16.0)
    main_energy_sources = Column(String(255), default="Grid electricity, Diesel")
    main_raw_materials = Column(String(255), default="Virgin materials")
    main_waste_types = Column(String(255), default="Process waste, packaging")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="industries", foreign_keys=[user_id])
    factories = relationship("Factory", back_populates="industry", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="industry", cascade="all, delete-orphan")
    assignments = relationship("FactoryAssignment", back_populates="industry", cascade="all, delete-orphan")

# 4. FACTORIES
class Factory(Base):
    __tablename__ = "factories"
    
    id = Column(Integer, primary_key=True, index=True)
    industry_id = Column(Integer, ForeignKey("industries.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    sector = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    industry = relationship("Industry", back_populates="factories")
    owner = relationship("User", back_populates="factories", foreign_keys=[owner_id])
    assignments = relationship("FactoryAssignment", back_populates="factory", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="factory", cascade="all, delete-orphan")

# 5. FACTORY ASSIGNMENTS (Replaces consultant_factory_assignments and regulator_factory_authorizations)
class FactoryAssignment(Base):
    __tablename__ = "factory_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False) # consultant or regulator
    factory_id = Column(Integer, ForeignKey("factories.id", use_alter=True, name="fk_assignment_factory"), nullable=True)
    industry_id = Column(Integer, ForeignKey("industries.id", use_alter=True, name="fk_assignment_industry"), nullable=True)
    role = Column(String(50), nullable=False) # sustainability_consultant or regulator_auditor
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="factory_assignments")
    factory = relationship("Factory", foreign_keys=[factory_id], back_populates="assignments")
    industry = relationship("Industry", foreign_keys=[industry_id], back_populates="assignments")
    assigner = relationship("User", foreign_keys=[assigned_by])

# Backwards compatibility aliases
ConsultantFactoryAssignment = FactoryAssignment
RegulatorFactoryAuthorization = FactoryAssignment

# 6. ASSESSMENTS
class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    industry_id = Column(Integer, ForeignKey("industries.id"), nullable=True)
    factory_id = Column(Integer, ForeignKey("factories.id"), nullable=True)
    name = Column(String(255), default="Monthly Carbon Audit")
    assessment_period = Column(String(100), default="Current Month")
    status = Column(String(50), default="draft") # draft, calculated, completed
    
    # Aggregated KPI Results
    total_emissions_tco2e = Column(Float, default=0.0)
    scope1_tco2e = Column(Float, default=0.0)
    scope2_tco2e = Column(Float, default=0.0)
    scope3_tco2e = Column(Float, default=0.0)
    emission_intensity = Column(Float, default=0.0)
    circularity_score = Column(Float, default=0.0)
    potential_reduction_tco2e = Column(Float, default=0.0)
    potential_savings_inr = Column(Float, default=0.0)
    confidence_level = Column(String(50), default="High")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="assessments")
    industry = relationship("Industry", back_populates="assessments")
    factory = relationship("Factory", back_populates="assessments")
    energy_inputs = relationship("EnergyInput", back_populates="assessment", cascade="all, delete-orphan")
    material_inputs = relationship("MaterialInput", back_populates="assessment", cascade="all, delete-orphan")
    waste_inputs = relationship("WasteInput", back_populates="assessment", cascade="all, delete-orphan")
    transport_inputs = relationship("TransportInput", back_populates="assessment", cascade="all, delete-orphan")
    emission_results = relationship("EmissionResult", back_populates="assessment", cascade="all, delete-orphan")
    hotspots = relationship("EmissionHotspot", back_populates="assessment", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="assessment", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="assessment", cascade="all, delete-orphan")
    action_plans = relationship("ActionPlan", back_populates="assessment", cascade="all, delete-orphan")
    data_confidence_records = relationship("DataConfidence", back_populates="assessment", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="assessment", cascade="all, delete-orphan")

# 7. ENERGY INPUTS
class EnergyInput(Base):
    __tablename__ = "energy_inputs"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    source_type = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    renewable_percentage = Column(Float, default=0.0)
    notes = Column(String(255), nullable=True)

    assessment = relationship("Assessment", back_populates="energy_inputs")

# 8. MATERIAL INPUTS
class MaterialInput(Base):
    __tablename__ = "material_inputs"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    material_name = Column(String(150), nullable=False)
    material_type = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    virgin_percentage = Column(Float, default=100.0)
    recycled_percentage = Column(Float, default=0.0)
    notes = Column(String(255), nullable=True)

    assessment = relationship("Assessment", back_populates="material_inputs")

# 9. WASTE INPUTS
class WasteInput(Base):
    __tablename__ = "waste_inputs"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    waste_type = Column(String(150), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    disposal_method = Column(String(100), nullable=False)
    recyclable_percentage = Column(Float, default=0.0)
    notes = Column(String(255), nullable=True)

    assessment = relationship("Assessment", back_populates="waste_inputs")

# 10. TRANSPORT INPUTS
class TransportInput(Base):
    __tablename__ = "transport_inputs"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    transport_mode = Column(String(100), nullable=False)
    distance_km = Column(Float, nullable=False)
    weight_tonnes = Column(Float, nullable=False)
    frequency_per_month = Column(Integer, default=1)

    assessment = relationship("Assessment", back_populates="transport_inputs")

# 11. EMISSION FACTORS
class EmissionFactor(Base):
    __tablename__ = "emission_factors"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)
    activity = Column(String(150), nullable=False, unique=True)
    unit = Column(String(50), nullable=False)
    factor = Column(Float, nullable=False)
    factor_unit = Column(String(50), nullable=False)
    source = Column(String(100), default="IPCC / CEA India / DEFRA")
    region = Column(String(50), default="India / Global")
    year = Column(Integer, default=2024)
    confidence_level = Column(String(50), default="High")
    version = Column(String(50), default="1.0")
    is_active = Column(Boolean, default=True)

# 12. EMISSION RESULTS
class EmissionResult(Base):
    __tablename__ = "emission_results"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    category = Column(String(100), nullable=False)
    source_name = Column(String(150), nullable=False)
    activity_value = Column(Float, nullable=False)
    activity_unit = Column(String(50), nullable=False)
    emission_factor_used = Column(Float, nullable=False)
    emissions_kg_co2e = Column(Float, nullable=False)
    scope = Column(String(50), nullable=False)

    assessment = relationship("Assessment", back_populates="emission_results")

# 13. EMISSION HOTSPOTS
class EmissionHotspot(Base):
    __tablename__ = "emission_hotspots"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    source_name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    emissions_kg_co2e = Column(Float, nullable=False)
    percentage_contribution = Column(Float, nullable=False)
    severity = Column(String(50), nullable=False)
    hotspot_score = Column(Float, nullable=False)
    anomaly_detected = Column(Boolean, default=False)
    explanation = Column(Text, nullable=False)

    assessment = relationship("Assessment", back_populates="hotspots")

# 14. DATA CONFIDENCE
class DataConfidence(Base):
    __tablename__ = "data_confidence"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    category = Column(String(100), nullable=True)
    score = Column(Float, default=100.0)
    level = Column(String(50), default="High")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="data_confidence_records")

# 15. RECOMMENDATION KNOWLEDGE BASE
class RecommendationKnowledge(Base):
    __tablename__ = "recommendation_knowledge_base"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    target_source = Column(String(150), nullable=False)
    reduction_min_pct = Column(Float, default=20.0)
    reduction_max_pct = Column(Float, default=40.0)
    cost_multiplier_inr_per_kw = Column(Float, default=50000.0)
    savings_rate_per_kwh = Column(Float, default=4.0)
    feasibility = Column(String(50), default="High")
    base_payback_months = Column(Integer, default=24)
    circularity_boost = Column(Float, default=15.0)
    reason_template = Column(Text, nullable=False)
    version = Column(String(50), default="1.0")
    is_active = Column(Boolean, default=True)

RecommendationKnowledgeBase = RecommendationKnowledge

# 16. RECOMMENDATIONS
class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    recommendation_key = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    target_emission_source = Column(String(150), nullable=False)
    reason = Column(Text, nullable=False)
    estimated_co2_reduction_kg = Column(Float, nullable=False)
    reduction_percentage = Column(Float, nullable=False)
    implementation_cost_inr = Column(Float, nullable=False)
    annual_savings_inr = Column(Float, nullable=False)
    payback_months = Column(Float, nullable=False)
    feasibility = Column(String(50), default="High")
    priority_rank = Column(Integer, default=1)
    confidence = Column(String(50), default="High")
    circularity_boost = Column(Float, default=5.0)
    assumptions = Column(Text, nullable=True)

    assessment = relationship("Assessment", back_populates="recommendations")

# 17. SCENARIOS
class Scenario(Base):
    __tablename__ = "scenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(String(255), nullable=True)
    solar_percentage = Column(Float, default=0.0)
    recycled_material_percentage = Column(Float, default=0.0)
    waste_recovery_percentage = Column(Float, default=0.0)
    transport_reduction_percentage = Column(Float, default=0.0)
    result_co2e_tonnes = Column(Float, nullable=False)
    reduction_percentage = Column(Float, nullable=False)
    cost_estimate_inr = Column(Float, nullable=False)
    annual_savings_inr = Column(Float, nullable=False)
    payback_months = Column(Float, nullable=False)
    circularity_score = Column(Float, nullable=False)
    is_recommended = Column(Boolean, default=False)

    assessment = relationship("Assessment", back_populates="scenarios")
    results = relationship("ScenarioResult", back_populates="scenario", cascade="all, delete-orphan")

# 18. SCENARIO RESULTS
class ScenarioResult(Base):
    __tablename__ = "scenario_results"
    
    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    co2_reduction_tonnes = Column(Float, default=0.0)
    annual_savings_inr = Column(Float, default=0.0)
    roi_months = Column(Float, default=0.0)
    summary_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scenario = relationship("Scenario", back_populates="results")

# 19. ACTION PLANS
class ActionPlan(Base):
    __tablename__ = "action_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Energy")
    priority = Column(String(50), default="High")
    owner = Column(String(150), default="Factory Operations")
    deadline = Column(String(100), default="Q3 2026")
    estimated_cost_inr = Column(Float, default=0.0)
    expected_co2_reduction_kg = Column(Float, default=0.0)
    status = Column(String(50), default="Planned")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="action_plans")
    assessment = relationship("Assessment", back_populates="action_plans")

# 20. REPORTS
class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=True)
    file_format = Column(String(50), default="PDF")
    file_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reports")
    assessment = relationship("Assessment", back_populates="reports")

# 21. AUDIT LOGS
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=True)
    factory_id = Column(Integer, nullable=True)
    ip_address = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
