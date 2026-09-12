export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  industry_id?: number;
  is_active?: boolean;
}

export interface Industry {
  id: number;
  company_name: string;
  industry_type: string;
  factory_location: string;
  production_type?: string;
  monthly_production: number;
  production_unit: string;
  number_of_employees: number;
  operating_hours_per_day: number;
  main_energy_sources?: string;
  main_raw_materials?: string;
  main_waste_types?: string;
}

export interface EmissionResult {
  id: number;
  category: string;
  source_name: string;
  activity_value: number;
  activity_unit: string;
  emission_factor_used: number;
  emissions_kg_co2e: number;
  scope: string;
}

export interface Hotspot {
  id: number;
  source_name: string;
  category: string;
  emissions_kg_co2e: number;
  percentage_contribution: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  hotspot_score: number;
  anomaly_detected: boolean;
  explanation: string;
}

export interface Recommendation {
  id: number;
  assessment_id?: number;
  recommendation_key: string;
  title: string;
  category: string;
  target_emission_source: string;
  reason: string;
  estimated_co2_reduction_kg: number;
  reduction_percentage: number;
  implementation_cost_inr: number;
  annual_savings_inr: number;
  payback_months: number;
  feasibility: "High" | "Medium" | "Low";
  priority_rank: number;
  confidence: string;
  circularity_boost: number;
  assumptions?: string;
}

export interface Assessment {
  id: number;
  name: string;
  assessment_period: string;
  status: string;
  total_emissions_tco2e: number;
  scope1_tco2e: number;
  scope2_tco2e: number;
  scope3_tco2e: number;
  emission_intensity: number;
  circularity_score: number;
  potential_reduction_tco2e: number;
  potential_savings_inr: number;
  confidence_level: string;
  created_at: string;
  industry_id?: number;
  factory_id?: number;
  factory_name?: string;
  industry?: Industry;
  hotspots?: Hotspot[];
  recommendations?: Recommendation[];
}

export interface SimulatorResult {
  baseline_co2e_t: number;
  simulated_co2e_t: number;
  avoided_co2e_t: number;
  reduction_percentage: number;
  estimated_capex_inr: number;
  estimated_annual_savings_inr: number;
  payback_months: number;
  new_circularity_score: number;
  baseline_circularity_score: number;
  circularity_delta: number;
  breakdown: {
    energy_avoided_t: number;
    materials_avoided_t: number;
    waste_avoided_t: number;
    transport_avoided_t: number;
  };
  summary_message: string;
}

export interface Scenario {
  id?: number;
  name: string;
  description?: string;
  solar_percentage: number;
  recycled_material_percentage: number;
  waste_recovery_percentage: number;
  transport_reduction_percentage: number;
  result_co2e_tonnes: number;
  reduction_percentage: number;
  cost_estimate_inr: number;
  annual_savings_inr: number;
  payback_months: number;
  circularity_score: number;
  is_recommended: boolean;
}

export interface ActionPlanItem {
  id: number;
  assessment_id: number;
  recommendation_id?: number;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  owner: string;
  deadline: string;
  estimated_cost_inr: number;
  expected_co2_reduction_kg: number;
  status: "Planned" | "In Progress" | "Completed";
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  has_assessment: boolean;
  has_factory?: boolean;
  factory_id?: number;
  assessment_id?: number;
  assessment_name?: string;
  factory_name?: string;
  industry_type?: string;
  location?: string;
  headline?: string;
  kpis: {
    total_emissions_tco2e?: number;
    potential_reduction_pct?: number;
    potential_reduction_tco2e?: number;
    carbon_intensity?: number;
    production_unit?: string;
    top_hotspot?: string;
    top_hotspot_pct?: number;
    top_hotspot_severity?: string;
    best_opportunity?: string;
    potential_annual_savings_inr?: number;
    circularity_score?: number;
    confidence_level?: string;
  };
  scopes?: {
    scope1_tco2e: number;
    scope2_tco2e: number;
    scope3_tco2e: number;
  };
  category_breakdown?: {
    Energy: number;
    Materials: number;
    Waste: number;
    Transport: number;
  };
  top_hotspots?: Array<{
    id: number;
    source_name: string;
    category: string;
    emissions_kg: number;
    percentage: number;
    severity: string;
    hotspot_score: number;
    anomaly: boolean;
    explanation: string;
  }>;
  top_recommendations?: Array<{
    id: number;
    title: string;
    category: string;
    target_source: string;
    reduction_pct: number;
    co2_cut_kg: number;
    cost_inr: number;
    savings_inr: number;
    payback_months: number;
    feasibility: string;
    priority_rank: number;
    reason: string;
  }>;
}


export interface AuditLogItem {
  id: number;
  user_id?: number;
  user_email?: string;
  role?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  factory_id?: number;
  ip_address?: string;
  details?: string;
  timestamp: string;
}

export interface AdminUserItem {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  industry_id?: number;
  created_at?: string;
}

export interface EmissionFactorItem {
  id: number;
  category: string;
  activity: string;
  unit: string;
  factor: number;
  factor_unit: string;
  source: string;
  region: string;
  year: number;
  confidence_level: string;
  version: string;
  is_active: boolean;
}

export interface RecommendationKnowledgeItem {
  id: number;
  key: string;
  title: string;
  category: string;
  target_source: string;
  reduction_min_pct: number;
  reduction_max_pct: number;
  cost_multiplier_inr_per_kw: number;
  savings_rate_per_kwh: number;
  feasibility: string;
  base_payback_months: number;
  circularity_boost: number;
  reason_template: string;
  version: string;
  is_active: boolean;
}

