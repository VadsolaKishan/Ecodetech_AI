import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Flame,
  Lightbulb,
  TrendingDown,
  CircleDollarSign,
  Award,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Layers,
  BarChart3,
  RefreshCw,
  Plus
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { dashboardApi, actionPlanApi } from "../services/api";
import { DashboardSummary } from "../types";

interface DashboardPageProps {
  activeAssessmentId?: number;
  onSelectAssessment?: (id: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Energy: "#F59E0B",     // Amber
  Materials: "#3B82F6",  // Cyber Blue
  Waste: "#EF4444",      // Critical Red
  Transport: "#10B981",  // Emerald Green
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ activeAssessmentId }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      if (!summary) {
        setLoading(true);
      }
      const data = await dashboardApi.getSummary(activeAssessmentId);
      setSummary(data);
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [activeAssessmentId]);

  const handleAddToActionPlan = async (rec: any) => {
    if (!summary?.assessment_id) return;
    try {
      await actionPlanApi.create(summary.assessment_id, {
        recommendation_id: rec.id,
        title: rec.title,
        category: rec.category,
        priority: rec.priority_rank === 1 ? "High" : "Medium",
        estimated_cost_inr: rec.cost_inr,
        expected_co2_reduction_kg: rec.co2_cut_kg,
        status: "Planned",
      });
      setActionSuccess(`Added "${rec.title.slice(0, 32)}..." to your Action Roadmap!`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-carbon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-industrial-400">Loading facility intelligence...</p>
        </div>
      </div>
    );
  }

  if (!summary?.has_assessment) {
    return (
      <div className="flex-1 p-8 max-w-4xl mx-auto text-center py-20 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-carbon-green/10 border border-carbon-green/30 text-carbon-green flex items-center justify-center mx-auto shadow-glow-green">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No factory profile found.</h2>
        <p className="text-sm text-industrial-400 max-w-md mx-auto">
          Create your factory profile to begin.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/profile"
            className="px-6 py-2.5 rounded-xl bg-carbon-green text-industrial-950 font-bold text-xs hover:bg-carbon-lime transition-all shadow-glow-green flex items-center space-x-2"
          >
            <span>Create Factory Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const kpis = summary.kpis;
  const categoryData = summary.category_breakdown
    ? Object.entries(summary.category_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  const scopeData = summary.scopes
    ? [
        { name: "Scope 1 (Direct Fuels)", tCO2e: summary.scopes.scope1_tco2e, fill: "#EF4444" },
        { name: "Scope 2 (Grid Electricity)", tCO2e: summary.scopes.scope2_tco2e, fill: "#F59E0B" },
        { name: "Scope 3 (Supply Chain)", tCO2e: summary.scopes.scope3_tco2e, fill: "#3B82F6" },
      ]
    : [];

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Action toast notification */}
      {actionSuccess && (
        <div className="p-3 bg-carbon-green/20 border border-carbon-green text-carbon-green rounded-xl text-xs flex items-center space-x-2 shadow-glow-green animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-carbon-green mb-1">
            <span className="w-2 h-2 rounded-full bg-carbon-green animate-ping"></span>
            <span>Live Plant Telemetry • {summary.factory_name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {summary.headline}
          </h1>
          <p className="text-xs text-industrial-400 mt-0.5">
            Sector: {summary.industry_type} | Location: {summary.location}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/simulator"
            className="px-4 py-2 rounded-xl bg-carbon-cyber/15 border border-carbon-cyber/40 text-carbon-cyber hover:bg-carbon-cyber/25 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-glow-cyber"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Launch What-If Simulator</span>
          </Link>
          <Link
            to="/assessment/new"
            className="px-4 py-2 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold flex items-center space-x-1.5 transition-all shadow-glow-green"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Audit</span>
          </Link>
        </div>
      </div>

      {/* Top 5 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Footprint */}
        <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800 hover:border-industrial-700 transition-all">
          <div className="flex items-center justify-between text-industrial-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Carbon Footprint</span>
            <Flame className="w-4 h-4 text-carbon-amber" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {kpis.total_emissions_tco2e?.toLocaleString()} <span className="text-xs font-normal text-industrial-400">tCO₂e</span>
          </div>
          <div className="mt-2 flex items-center space-x-1 text-[11px] text-carbon-green font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>↓ {kpis.potential_reduction_pct}% potential reduction</span>
          </div>
        </div>

        {/* Card 2: Top Hotspot */}
        <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800 hover:border-carbon-critical/40 transition-all">
          <div className="flex items-center justify-between text-industrial-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Primary Hotspot</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
              kpis.top_hotspot_severity === "Critical"
                ? "bg-carbon-critical/20 text-carbon-critical border border-carbon-critical/30"
                : "bg-carbon-amber/20 text-carbon-amber border border-carbon-amber/30"
            }`}>
              {kpis.top_hotspot_severity}
            </span>
          </div>
          <div className="text-base font-bold text-white truncate" title={kpis.top_hotspot}>
            {kpis.top_hotspot}
          </div>
          <div className="mt-2 text-[11px] text-industrial-400 font-mono">
            Contributes <span className="text-white font-semibold">{kpis.top_hotspot_pct}%</span> of facility total
          </div>
        </div>

        {/* Card 3: Best Opportunity */}
        <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800 hover:border-carbon-green/40 transition-all">
          <div className="flex items-center justify-between text-industrial-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Best Opportunity</span>
            <Lightbulb className="w-4 h-4 text-carbon-lime" />
          </div>
          <div className="text-xs font-bold text-white line-clamp-2 leading-snug" title={kpis.best_opportunity}>
            {kpis.best_opportunity}
          </div>
          <div className="mt-2 text-[11px] text-carbon-lime font-mono">
            High ROI Priority Intervention
          </div>
        </div>

        {/* Card 4: Potential Annual Savings */}
        <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800 hover:border-industrial-700 transition-all">
          <div className="flex items-center justify-between text-industrial-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Potential Savings</span>
            <CircleDollarSign className="w-4 h-4 text-carbon-green" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            ₹{(kpis.potential_annual_savings_inr ? kpis.potential_annual_savings_inr / 100000 : 0).toFixed(2)}{" "}
            <span className="text-xs font-normal text-industrial-400">Lakh/yr</span>
          </div>
          <div className="mt-2 text-[11px] text-industrial-400">
            Estimated OPEX displacement
          </div>
        </div>

        {/* Card 5: Circularity Score */}
        <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800 hover:border-carbon-green/40 transition-all">
          <div className="flex items-center justify-between text-industrial-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Circularity Index</span>
            <Award className="w-4 h-4 text-carbon-cyber" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono flex items-baseline space-x-1">
            <span>{kpis.circularity_score}</span>
            <span className="text-xs text-industrial-400 font-normal">/100</span>
          </div>
          <div className="mt-2 text-[11px] text-carbon-cyber font-mono font-medium">
            {kpis.circularity_score && kpis.circularity_score >= 60 ? "★ High Circularity" : "Linear Risk Profile"}
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Category Emission Breakdown (Donut) */}
        <div className="p-5 rounded-2xl bg-industrial-900/80 border border-industrial-800 shadow-card-dark flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-carbon-amber"></span>
              <span>Emissions by Operational Stream</span>
            </h3>
            <span className="text-[10px] font-mono text-industrial-400">tCO₂e</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#10B981"} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`${val} tCO₂e`, "Emissions"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-industrial-800 text-xs">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.name] }}></span>
                <span className="text-industrial-300 text-[11px]">{c.name}:</span>
                <span className="font-mono text-white text-[11px] font-semibold">{c.value}t</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Scope 1, Scope 2, Scope 3 Distribution */}
        <div className="p-5 rounded-2xl bg-industrial-900/80 border border-industrial-800 shadow-card-dark lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-carbon-cyber" />
              <span>GHG Protocol Scope Distribution (Scopes 1, 2 & 3)</span>
            </h3>
            <span className="text-[10px] font-mono text-carbon-green bg-carbon-green/10 px-2 py-0.5 rounded border border-carbon-green/30">
              Intensity: {kpis.carbon_intensity} kg/unit
            </span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scopeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}t`} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={130} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`${val} tCO₂e`, "Emissions"]}
                />
                <Bar dataKey="tCO2e" radius={[0, 4, 4, 0]}>
                  {scopeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 border-t border-industrial-800 text-xs text-industrial-400 flex items-center justify-between">
            <span>Traceable against official Indian CEA Grid v19 and IPCC AR6 Tier 1 factors.</span>
            <Link to="/reports" className="text-carbon-green hover:underline text-[11px] font-medium flex items-center gap-1">
              View Audit Data <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hotspots Leak Points & Quick Recommendations Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Emission Hotspots Table */}
        <div className="p-5 rounded-2xl bg-industrial-900/80 border border-industrial-800 shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-carbon-critical" />
              <h3 className="text-sm font-bold text-white">Ranked Emission Hotspots</h3>
            </div>
            <Link to="/hotspots" className="text-xs text-carbon-green hover:underline font-mono">
              View All Hotspots →
            </Link>
          </div>

          <div className="space-y-3">
            {summary.top_hotspots?.map((h, idx) => (
              <div
                key={h.id}
                className="p-3 rounded-xl bg-industrial-950/60 border border-industrial-800 hover:border-industrial-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-industrial-500">#{idx + 1}</span>
                    {h.source_name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      h.severity === "Critical"
                        ? "bg-carbon-critical/20 text-carbon-critical border border-carbon-critical/30"
                        : h.severity === "High"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {h.percentage}% • {h.severity}
                  </span>
                </div>
                <p className="text-[11px] text-industrial-400 leading-relaxed mt-1">
                  {h.explanation}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-industrial-500 pt-1.5 border-t border-industrial-850">
                  <span>Category: {h.category}</span>
                  <span>Emissions: {h.emissions_kg.toLocaleString()} kg CO₂e</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Circular Interventions Cards */}
        <div className="p-5 rounded-2xl bg-industrial-900/80 border border-industrial-800 shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-carbon-lime" />
              <h3 className="text-sm font-bold text-white">High-Impact Circular Quick Wins</h3>
            </div>
            <Link to="/recommendations" className="text-xs text-carbon-green hover:underline font-mono">
              View All Recommendations →
            </Link>
          </div>

          <div className="space-y-3">
            {summary.top_recommendations?.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl bg-industrial-950/60 border border-industrial-800 hover:border-carbon-green/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono bg-carbon-green/20 text-carbon-green px-1.5 py-0.5 rounded font-bold border border-carbon-green/30">
                      P{r.priority_rank}
                    </span>
                    <h4 className="font-semibold text-xs text-white group-hover:text-carbon-green transition-colors">
                      {r.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-carbon-lime font-bold shrink-0">
                    ↓ {r.reduction_pct}% CO₂
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 my-2 py-1.5 bg-industrial-900/60 rounded-lg px-2 text-[10px] font-mono text-industrial-300">
                  <div>
                    <span className="text-industrial-500 block">CAPEX</span>
                    <span>₹{(r.cost_inr / 100000).toFixed(1)}L</span>
                  </div>
                  <div>
                    <span className="text-industrial-500 block">Annual Savings</span>
                    <span className="text-carbon-green">₹{(r.savings_inr / 100000).toFixed(1)}L/yr</span>
                  </div>
                  <div>
                    <span className="text-industrial-500 block">Payback</span>
                    <span className="text-white">{r.payback_months} mos</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    to="/simulator"
                    className="text-[11px] text-carbon-cyber hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sliders className="w-3 h-3" /> Simulate Impact
                  </Link>
                  <button
                    onClick={() => handleAddToActionPlan(r)}
                    className="px-2.5 py-1 rounded bg-industrial-800 hover:bg-carbon-green hover:text-industrial-950 text-industrial-200 text-[10px] font-semibold transition-colors border border-industrial-700"
                  >
                    + Add to Action Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
