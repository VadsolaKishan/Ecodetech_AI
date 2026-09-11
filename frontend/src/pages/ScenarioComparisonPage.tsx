import React, { useState, useEffect } from "react";
import { GitCompare, Sparkles, CheckCircle2, Sliders, ArrowRight, RefreshCw, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { simulatorApi, dashboardApi } from "../services/api";
import { Scenario } from "../types";

interface ScenarioComparisonPageProps {
  activeAssessmentId?: number;
}

const formatINR = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
};

export const ScenarioComparisonPage: React.FC<ScenarioComparisonPageProps> = ({ activeAssessmentId }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScenarios = async () => {
    try {
      if (scenarios.length === 0) {
        setLoading(true);
      }
      const targetId = activeAssessmentId || parseInt(localStorage.getItem("carbon_active_assessment") || "1");
      const list = await simulatorApi.getScenarios(targetId);
      setScenarios(list || []);
    } catch (err) {
      console.error("Failed to fetch scenarios:", err);
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [activeAssessmentId]);

  if (loading && scenarios.length === 0) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-carbon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-industrial-400">Compiling multi-scenario comparative matrices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-carbon-green mb-1">
            <GitCompare className="w-4 h-4" />
            <span>Multi-Scenario Decision Matrix • HackOut'26 Scenario Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Comparative Pathway Analysis</h1>
          <p className="text-xs text-industrial-400 mt-1">
            Evaluate alternative decarbonization trajectories side-by-side to determine optimal capital allocation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchScenarios}
            className="p-2 rounded-xl bg-industrial-900 border border-industrial-700 hover:border-carbon-green text-industrial-400 hover:text-white transition-all text-xs flex items-center space-x-1"
            title="Refresh Matrix"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/simulator"
            className="px-4 py-2 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold flex items-center space-x-1.5 shadow-glow-green"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Sliders</span>
          </Link>
        </div>
      </div>

      {/* Scenarios Display */}
      {scenarios.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-industrial-900/60 border border-industrial-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-industrial-950 border border-industrial-800 text-carbon-green flex items-center justify-center mx-auto">
            <GitCompare className="w-6 h-6 text-industrial-400" />
          </div>
          <h3 className="text-base font-bold text-white">No scenarios created yet</h3>
          <p className="text-xs text-industrial-400 max-w-sm mx-auto">
            Use the What-If Simulator to test decarbonization levers and save comparative scenario trajectories.
          </p>
          <Link
            to="/simulator"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-carbon-green text-industrial-950 text-xs font-bold hover:bg-carbon-lime transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Launch What-If Simulator</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((scen, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl flex flex-col justify-between border transition-all ${
                scen.is_recommended
                  ? "bg-gradient-to-b from-industrial-900 via-industrial-900/90 to-industrial-850 border-carbon-green shadow-glow-green"
                  : "bg-industrial-900/80 border-industrial-800 hover:border-industrial-700"
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-industrial-400 font-semibold uppercase">
                    Scenario {String.fromCharCode(65 + idx)}
                  </span>
                  {scen.is_recommended && (
                    <span className="text-[10px] font-mono font-bold bg-carbon-green text-industrial-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Recommended
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-white mb-1">{scen.name}</h3>
                <p className="text-[11px] text-industrial-400 leading-relaxed mb-3 min-h-[36px]">
                  {scen.description}
                </p>

                {/* Lever Tags */}
                <div className="grid grid-cols-2 gap-1 mb-4">
                  <div className="px-2 py-1 rounded bg-industrial-950/80 border border-industrial-800 text-[10px] font-mono text-industrial-300">
                    Solar: <span className="font-semibold text-amber-400">{scen.solar_percentage}%</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-industrial-950/80 border border-industrial-800 text-[10px] font-mono text-industrial-300">
                    Recycled: <span className="font-semibold text-blue-400">{scen.recycled_material_percentage}%</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-industrial-950/80 border border-industrial-800 text-[10px] font-mono text-industrial-300">
                    Waste: <span className="font-semibold text-emerald-400">{scen.waste_recovery_percentage}%</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-industrial-950/80 border border-industrial-800 text-[10px] font-mono text-industrial-300">
                    Transport: <span className="font-semibold text-purple-400">{scen.transport_reduction_percentage}%</span>
                  </div>
                </div>

                {/* KPI metrics */}
                <div className="space-y-2 pt-2 border-t border-industrial-800 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-industrial-400 text-[11px]">CO₂ Output:</span>
                    <span className="font-bold text-white">{scen.result_co2e_tonnes.toLocaleString("en-IN", { maximumFractionDigits: 1 })} t/yr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-industrial-400 text-[11px]">Reduction:</span>
                    <span className={`font-bold ${scen.reduction_percentage > 0 ? "text-carbon-green" : "text-industrial-400"}`}>
                      {scen.reduction_percentage > 0 ? `-${scen.reduction_percentage.toFixed(1)}%` : "0.0%"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-industrial-400 text-[11px]">CAPEX Req:</span>
                    <span className="text-white">{formatINR(scen.cost_estimate_inr)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-industrial-400 text-[11px]">Ann. Savings:</span>
                    <span className="text-carbon-lime font-bold">{formatINR(scen.annual_savings_inr)}/yr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-industrial-400 text-[11px]">Payback:</span>
                    <span className="text-industrial-300">
                      {scen.payback_months > 0 ? `${scen.payback_months.toFixed(0)} months` : "Immediate"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-industrial-400 text-[11px]">Circularity:</span>
                    <span className="text-carbon-green font-bold">{scen.circularity_score.toFixed(1)}/100</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-industrial-800">
                <Link
                  to="/action-plan"
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    scen.is_recommended
                      ? "bg-carbon-green text-industrial-950 hover:bg-carbon-lime shadow-glow-green"
                      : "bg-industrial-800 hover:bg-industrial-700 text-industrial-200"
                  }`}
                >
                  <span>Commit Pathway</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
