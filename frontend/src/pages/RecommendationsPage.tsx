import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Lightbulb,
  CheckCircle,
  Sliders,
  Eye,
  Plus,
  CircleDollarSign,
  TrendingDown,
  Clock,
  Award,
  Sparkles,
  X,
  ShieldCheck,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { analysisApi, dashboardApi, actionPlanApi } from "../services/api";
import { Recommendation } from "../types";

interface RecommendationsPageProps {
  activeAssessmentId?: number;
  activeFactoryName?: string;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ activeAssessmentId, activeFactoryName }) => {
  const navigate = useNavigate();
  const { isReadOnly } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalRec, setActiveModalRec] = useState<Recommendation | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  const fetchRecs = async () => {
    if (!activeAssessmentId) {
      setRecommendations([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await analysisApi.getRecommendations(activeAssessmentId);
      if (data && Array.isArray(data)) {
        setRecommendations(data);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error(err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, [activeAssessmentId]);

  const handleAddToActionPlan = async (rec: Recommendation) => {
    const targetId = rec.assessment_id || activeAssessmentId;
    if (!targetId) return;
    try {
      setAddingId(rec.id);
      await actionPlanApi.create(targetId, {
        recommendation_id: rec.id,
        title: rec.title,
        category: rec.category,
        priority: rec.priority_rank === 1 ? "High" : rec.priority_rank <= 3 ? "Medium" : "Low",
        owner: "Factory Operations Team",
        deadline: "Q4 2026",
        estimated_cost_inr: rec.implementation_cost_inr,
        expected_co2_reduction_kg: rec.estimated_co2_reduction_kg,
        status: "Planned",
      });
      setToastMsg(`Added "${rec.title}" to Action Roadmap!`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  const filteredRecs = selectedCategory === "all"
    ? recommendations
    : recommendations.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());

  if (loading && !isReadOnly) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-carbon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-industrial-400">Scoring circular economy alternatives...</p>
        </div>
      </div>
    );
  }

  if (!activeAssessmentId || recommendations.length === 0) {
    return (
      <div className="flex-1 p-8 max-w-4xl mx-auto text-center py-20 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-carbon-lime/10 border border-carbon-lime/30 text-carbon-lime flex items-center justify-center mx-auto shadow-glow-lime">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {activeFactoryName ? `No Recommendations Found for ${activeFactoryName}` : "No Active Carbon Audit Found"}
        </h2>
        <p className="text-sm text-industrial-400 max-w-md mx-auto">
          {activeFactoryName
            ? `Run a carbon assessment for ${activeFactoryName} to receive tailored CAPEX models, fuel switching pathways, and ROI-ranked circular interventions.`
            : "Select a facility or run an assessment to unlock AI-generated circular interventions."}
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/assessment/new"
            className="px-6 py-2.5 rounded-xl bg-carbon-green text-industrial-950 font-bold text-xs hover:bg-carbon-lime transition-all shadow-glow-green flex items-center space-x-2"
          >
            <span>Run Facility Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 space-y-6 max-w-7xl mx-auto text-white">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3 bg-carbon-green/20 border border-carbon-green text-carbon-green rounded-xl text-xs flex items-center space-x-2 shadow-glow-green animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-carbon-lime mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Circular Recommendation Engine • Multi-Attribute ROI Scoring</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Ranked Circular Interventions</h1>
          <p className="text-xs text-industrial-400 mt-1">
            High-feasibility pathways tailored to your plant's specific emission leaks, CAPEX models, and payback horizons.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-1.5 p-1 bg-industrial-900 rounded-xl border border-industrial-800 text-xs">
          {["all", "Energy", "Materials", "Waste", "Transport"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all capitalize font-medium ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-industrial-800 text-white shadow-sm border border-industrial-700"
                  : "text-industrial-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecs.map((r) => {
          let assumptionsObj: any = null;
          try {
            if (r.assumptions) assumptionsObj = JSON.parse(r.assumptions);
          } catch (e) {}

          return (
            <div
              key={r.id}
              className="p-6 rounded-2xl bg-industrial-900/80 border border-industrial-800 hover:border-carbon-green/50 transition-all flex flex-col justify-between shadow-card-dark group"
            >
              <div>
                {/* Priority & Category Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-carbon-green/20 text-carbon-green font-mono font-bold text-xs border border-carbon-green/30">
                      PRIORITY {r.priority_rank}
                    </span>
                    <span className="text-xs font-mono text-industrial-400">
                      Category: {r.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-carbon-lime font-bold bg-carbon-lime/10 px-2 py-0.5 rounded border border-carbon-lime/20">
                    +{r.circularity_boost} Circularity Pts
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-carbon-green transition-colors mb-1">
                  {r.title}
                </h3>
                <p className="text-xs text-industrial-400 font-mono mb-3">
                  Targets Hotspot: <span className="text-industrial-200">{r.target_emission_source}</span>
                </p>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-industrial-950/70 border border-industrial-850 text-xs font-mono mb-4">
                  <div>
                    <span className="text-industrial-500 block text-[10px]">CO₂ Cut</span>
                    <span className="text-carbon-green font-bold">↓ {r.reduction_percentage}%</span>
                  </div>
                  <div>
                    <span className="text-industrial-500 block text-[10px]">Estimated CAPEX</span>
                    <span className="text-white font-bold">₹{(r.implementation_cost_inr / 100000).toFixed(1)}L</span>
                  </div>
                  <div>
                    <span className="text-industrial-500 block text-[10px]">Annual Savings</span>
                    <span className="text-carbon-lime font-bold">₹{(r.annual_savings_inr / 100000).toFixed(1)}L</span>
                  </div>
                  <div>
                    <span className="text-industrial-500 block text-[10px]">Payback</span>
                    <span className="text-white font-bold">{r.payback_months} mos</span>
                  </div>
                </div>

                {/* Why EcoDetect Recommends this */}
                <div className="p-3.5 rounded-xl bg-industrial-950/40 border border-industrial-800 text-xs leading-relaxed text-industrial-300 mb-4">
                  <span className="text-carbon-green font-semibold block text-[11px] mb-1">
                    Why EcoDetect recommends this:
                  </span>
                  {r.reason}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-industrial-800/80 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalRec(r)}
                  className="px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-industrial-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Calculation Details</span>
                </button>

                <div className="flex items-center space-x-2">
                  <Link
                    to="/simulator"
                    className="px-3 py-1.5 rounded-lg bg-carbon-cyber/15 border border-carbon-cyber/30 text-carbon-cyber hover:bg-carbon-cyber/25 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Simulate</span>
                  </Link>

                  <button
                    type="button"
                    disabled={addingId === r.id}
                    onClick={() => handleAddToActionPlan(r)}
                    className="px-3 py-1.5 rounded-lg bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold flex items-center gap-1 transition-all shadow-glow-green disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{addingId === r.id ? "Adding..." : "Add to Action Plan"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Calculation Details Modal */}
      {activeModalRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-industrial-900 border border-industrial-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-industrial-800">
              <div>
                <span className="text-[10px] font-mono text-carbon-green uppercase font-bold">
                  Calculation Model & Assumptions
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{activeModalRec.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalRec(null)}
                className="p-1.5 text-industrial-400 hover:text-white hover:bg-industrial-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-industrial-950 rounded-xl border border-industrial-800">
                <span className="text-industrial-400 block text-[10px]">Avoided CO₂</span>
                <span className="text-white font-bold">{activeModalRec.estimated_co2_reduction_kg.toLocaleString()} kg</span>
              </div>
              <div className="p-3 bg-industrial-950 rounded-xl border border-industrial-800">
                <span className="text-industrial-400 block text-[10px]">CAPEX Investment</span>
                <span className="text-white font-bold">₹{activeModalRec.implementation_cost_inr.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-industrial-950 rounded-xl border border-industrial-800">
                <span className="text-industrial-400 block text-[10px]">Projected Savings</span>
                <span className="text-carbon-green font-bold">₹{activeModalRec.annual_savings_inr.toLocaleString()}/yr</span>
              </div>
              <div className="p-3 bg-industrial-950 rounded-xl border border-industrial-800">
                <span className="text-industrial-400 block text-[10px]">Feasibility</span>
                <span className="text-carbon-lime font-bold">{activeModalRec.feasibility}</span>
              </div>
            </div>

            {/* Assumptions Breakdown */}
            <div className="space-y-3 text-xs leading-relaxed text-industrial-300">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                Methodology & Transparent Formula Basis
              </h4>
              <p className="p-3 bg-industrial-950/70 rounded-xl border border-industrial-800">
                • <b>Emission Baseline:</b> Targets {activeModalRec.target_emission_source} using standard IPCC Tier 1 & CEA Indian Grid Baseline factors.
              </p>
              <p className="p-3 bg-industrial-950/70 rounded-xl border border-industrial-800">
                • <b>Decarbonization Potential:</b> Modeled at {activeModalRec.reduction_percentage}% average displacement based on verified industrial best practices.
              </p>
              <p className="p-3 bg-industrial-950/70 rounded-xl border border-industrial-800">
                • <b>Financial Payback:</b> Payback calculated deterministically as <code className="text-carbon-green">CAPEX / Annual OPEX Savings * 12</code> = {activeModalRec.payback_months} months.
              </p>
              <p className="p-3 bg-industrial-950/70 rounded-xl border border-industrial-800">
                • <b>Compliance & Scope:</b> Supports BEE PAT scheme energy conservation goals and BRSR Core disclosures for supply chain sustainability.
              </p>
            </div>

            <div className="pt-3 border-t border-industrial-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModalRec(null)}
                className="px-4 py-2 rounded-xl bg-industrial-800 text-industrial-300 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddToActionPlan(activeModalRec);
                  setActiveModalRec(null);
                }}
                className="px-4 py-2 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold shadow-glow-green"
              >
                Add to Action Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
