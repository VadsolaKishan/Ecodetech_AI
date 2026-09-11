import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="factory_operator") # sme_owner, factory_operator, consultant, regulator
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    industries = relationship("Industry", back_populates="owner", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    action_plans = relationship("ActionPlan", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")

class Industry(Base):
    __tablename__ = "industries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String(255), nullable=False)
    industry_type = Column(String(100), nullable=False) # Manufacturing, Textile, Food Processing, Cement, Chemical, Metal, Automotive, Packaging, Other
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

    owner = relationship("User", back_populates="industries")
    assessments = relationship("Assessment", back_populates="industry", cascade="all, delete-orphan")

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    industry_id = Column(Integer, ForeignKey("industries.id"), nullable=False)
    name = Column(String(255), default="Monthly Carbon Audit")
    assessment_period = Column(String(100), default="Current Month")
    status = Column(String(50), default="draft") # draft, calculated, completed
    
    # Aggregated KPI Results
    total_emissions_tco2e = Column(Float, default=0.0)
    scope1_tco2e = Column(Float, default=0.0)
    scope2_tco2e = Column(Float, default=0.0)
    scope3_tco2e = Column(Float, default=0.0)
    emission_intensity = Column(Float, default=0.0) # kg CO2e / unit of product
    circularity_score = Column(Float, default=0.0) # 0 to 100
    potential_reduction_tco2e = Column(Float, default=0.0)
    potential_savings_inr = Column(Float, default=0.0)
    confidence_level = Column(String(50), default="High")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="assessments")
    industry = relationship("Industry", back_populates="assessments")
    energy_inputs = relationship("EnergyInput", back_populates="assessment", cascade="all, delete-orphan")
    material_inputs = relationship("MaterialInput", back_populates="assessment", cascade="all, delete-orphan")
    waste_inputs = relationship("WasteInput", back_populates="assessment", cascade="all, delete-orphan")
    transport_inputs = relationship("TransportInput", back_populates="assessment", cascade="all, delete-orphan")
    emission_results = relationship("EmissionResult", back_populates="assessment", cascade="all, delete-orphan")
    hotspots = relationship("EmissionHotspot", back_populates="assessment", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="assessment", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="assessment", cascade="all, delete-orphan")
    action_plans = relationship("ActionPlan", back_populates="assessment", cascade="all, delete-orphan")

class EnergyInput(Base):
    __tablename__ = "energy_inputs"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    source_type = Column(String(100), nullable=False) # grid_electricity, solar_onsite, coal, diesel, natural_gas, biomass, lpg
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False) # kWh, MWh, litre, kg, tonne, m3
    renewable_percentage = Column(Float, default=0.0)
    notes = Column(String(255), nullable=True)

    assessment = relationship("Assessment", back_populates="energy_inputs")

class MaterialInput(Base):
    __tablename__ = "material_inputs"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    material_name = Column(String(150), nullable=False)
    material_type = Column(String(100), nullable=False) # Metals, Plastics/Polymers, Textiles/Fibers, Paper/Cardboard, Chemicals, Minerals/Aggregates, Other
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="tonne")
    virgin_percentage = Column(Float, default=100.0)
    recycled_percentage = Column(Float, default=0.0)
    supplier_distance_km = Column(Float, default=100.0)

    assessment = relationship("Assessment", back_populates="material_inputs")

class WasteInput(Base):
    __tablename__ = "waste_inputs"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    waste_type = Column(String(150), nullable=False) # Organic, Plastic/Packaging, Ash/Slag, Hazardous, Scrap Metal, General Mixed
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="tonne")
    disposal_method = Column(String(100), default="landfill") # landfill, recycling, composting, incineration, byproduct_reuse
    recyclable_percentage = Column(Float, default=0.0)
    current_treatment = Column(String(255), nullable=True)

    assessment = relationship("Assessment", back_populates="waste_inputs")

class TransportInput(Base):
    __tablename__ = "transport_inputs"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    transport_mode = Column(String(100), default="heavy_truck") # heavy_truck, medium_truck, rail, electric_van
    distance_km = Column(Float, nullable=False)
    weight_tonnes = Column(Float, nullable=False)
    frequency_per_month = Column(Integer, default=1)

    assessment = relationship("Assessment", back_populates="transport_inputs")

class EmissionFactor(Base):
    __tablename__ = "emission_factors"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False) # energy, materials, waste, transport
    activity = Column(String(150), nullable=False, unique=True)
    unit = Column(String(50), nullable=False)
    factor = Column(Float, nullable=False) # kg CO2e per unit
    factor_unit = Column(String(50), nullable=False) # kg CO2e/unit
    source = Column(String(100), default="IPCC / CEA India / DEFRA")
    region = Column(String(50), default="India / Global")
    year = Column(Integer, default=2024)
    confidence_level = Column(String(50), default="High")

class EmissionResult(Base):
    __tablename__ = "emission_results"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    category = Column(String(100), nullable=False) # Energy, Materials, Waste, Transport
    source_name = Column(String(150), nullable=False)
    activity_value = Column(Float, nullable=False)
    activity_unit = Column(String(50), nullable=False)
    emission_factor_used = Column(Float, nullable=False)
    emissions_kg_co2e = Column(Float, nullable=False)
    scope = Column(String(50), nullable=False) # Scope 1, Scope 2, Scope 3

    assessment = relationship("Assessment", back_populates="emission_results")

class EmissionHotspot(Base):
    __tablename__ = "emission_hotspots"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    source_name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    emissions_kg_co2e = Column(Float, nullable=False)
    percentage_contribution = Column(Float, nullable=False)
    severity = Column(String(50), nullable=False) # Critical, High, Medium, Low
    hotspot_score = Column(Float, nullable=False) # 0 to 100
    anomaly_detected = Column(Boolean, default=False)
    explanation = Column(Text, nullable=False)

    assessment = relationship("Assessment", back_populates="hotspots")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    recommendation_key = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Energy, Materials, Waste, Transport, Process
    target_emission_source = Column(String(150), nullable=False)
    reason = Column(Text, nullable=False)
    estimated_co2_reduction_kg = Column(Float, nullable=False)
    reduction_percentage = Column(Float, nullable=False)
    implementation_cost_inr = Column(Float, nullable=False)
    annual_savings_inr = Column(Float, nullable=False)
    payback_months = Column(Float, nullable=False)
    feasibility = Column(String(50), default="High") # High, Medium, Low
    priority_rank = Column(Integer, default=1)
    confidence = Column(String(50), default="High")
    circularity_boost = Column(Float, default=5.0) # + points to circularity score
    assumptions = Column(Text, nullable=True) # JSON or markdown string

    assessment = relationship("Assessment", back_populates="recommendations")

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

class ActionPlan(Base):
    __tablename__ = "action_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Energy")
    priority = Column(String(50), default="High") # High, Medium, Low
    owner = Column(String(150), default="Factory Operations")
    deadline = Column(String(100), default="Q3 2026")
    estimated_cost_inr = Column(Float, default=0.0)
    expected_co2_reduction_kg = Column(Float, default=0.0)
    status = Column(String(50), default="Planned") # Planned, In Progress, Completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="action_plans")
    assessment = relationship("Assessment", back_populates="action_plans")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False) # assessment_created, calculated, scenario_saved, etc.
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
