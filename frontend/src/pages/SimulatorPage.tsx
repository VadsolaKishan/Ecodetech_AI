import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Sun, 
  RefreshCw, 
  Trash2, 
  Truck, 
  TrendingDown, 
  CircleDollarSign, 
  Award, 
  Sparkles, 
  Save, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import confetti from "canvas-confetti";
import { simulatorApi, dashboardApi } from "../services/api";
import { SimulatorResult } from "../types";

interface SimulatorPageProps {
  activeAssessmentId?: number;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({ activeAssessmentId }) => {
  const [assessmentId, setAssessmentId] = useState<number | null>(activeAssessmentId || null);

  // Sliders State
  const [solarPct, setSolarPct] = useState(30);
  const [recycledPct, setRecycledPct] = useState(35);
  const [wasteRecPct, setWasteRecPct] = useState(50);
  const [transportRedPct, setTransportRedPct] = useState(20);

  // Simulation Output
  const [simResult, setSimResult] = useState<SimulatorResult | null>(null);
  const [scenarioName, setScenarioName] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load active assessment if not provided
  useEffect(() => {
    const initId = async () => {
      if (!assessmentId) {
        const sum = await dashboardApi.getSummary();
        if (sum.assessment_id) setAssessmentId(sum.assessment_id);
      }
    };
    initId();
  }, [activeAssessmentId]);

  // Recalculate simulation on slider change
  const runSimulation = async () => {
    if (!assessmentId) return;
    try {
      setLoading(true);
      const res = await simulatorApi.calculate(assessmentId, {
        solar_percentage: solarPct,
        recycled_material_percentage: recycledPct,
        waste_recovery_percentage: wasteRecPct,
        transport_reduction_percentage: transportRedPct,
      });
      setSimResult(res);
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [assessmentId, solarPct, recycledPct, wasteRecPct, transportRedPct]);

  const handleSaveScenario = async () => {
    if (!assessmentId || !simResult) return;
    try {
      await simulatorApi.saveScenario(assessmentId, {
        name: scenarioName || `Scenario ${solarPct}% Solar + ${recycledPct}% Recycled`,
        solar_percentage: solarPct,
        recycled_material_percentage: recycledPct,
        waste_recovery_percentage: wasteRecPct,
        transport_reduction_percentage: transportRedPct,
      });
      setSavedSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => setSavedSuccess(false), 3500);
      setScenarioName("");
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = simResult
    ? [
        {
          metric: "Carbon Footprint (tCO₂e)",
          Baseline: simResult.baseline_co2e_t,
          Simulated: simResult.simulated_co2e_t,
        },
      ]
    : [];

  return (
    <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-carbon-green mb-1">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>Interactive Industrial Digital Twin • HackOut'26 Killer Feature</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">What-If Decarbonization Simulator</h1>
          <p className="text-xs text-industrial-400 mt-1">
            Adjust operational levers to simulate real-time CO₂ reductions, capital expenditure, annual savings, and circularity index.
          </p>
        </div>

        {/* Save Scenario Form */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="Name this scenario..."
            className="bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-2 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green w-48"
          />
          <button
            onClick={handleSaveScenario}
            disabled={!simResult}
            className="px-4 py-2 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold flex items-center space-x-1.5 transition-all shadow-glow-green"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Scenario</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-carbon-green/20 border border-carbon-green text-carbon-green rounded-xl text-xs flex items-center space-x-2 shadow-glow-green animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Scenario successfully saved to your Scenario Matrix comparison!</span>
        </div>
      )}

      {/* Main Grid: Sliders on Left, Live Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Reactive Interactive Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-industrial-900/90 border border-industrial-800 shadow-card-dark space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-industrial-800">
              <Sliders className="w-4 h-4 text-carbon-green" />
              <span>Decarbonization Levers</span>
            </h3>

            {/* Slider 1: Solar Adoption */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-carbon-amber" />
                  <span>On-Site Solar PV Adoption</span>
                </span>
                <span className="font-mono text-carbon-amber font-bold text-sm bg-industrial-950 px-2 py-0.5 rounded border border-industrial-800">
                  {solarPct}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={5}
                value={solarPct}
                onChange={(e) => setSolarPct(parseInt(e.target.value))}
                className="w-full h-2 bg-industrial-950 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-industrial-500 font-mono">
                <span>0% Grid only</span>
                <span>40% Net-metered</span>
                <span>80% Heavy Solar</span>
              </div>
            </div>

            {/* Slider 2: Recycled Materials */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-carbon-cyber" />
                  <span>Recycled Material Substitution</span>
                </span>
                <span className="font-mono text-carbon-cyber font-bold text-sm bg-industrial-950 px-2 py-0.5 rounded border border-industrial-800">
                  {recycledPct}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={recycledPct}
                onChange={(e) => setRecycledPct(parseInt(e.target.value))}
                className="w-full h-2 bg-industrial-950 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-industrial-500 font-mono">
                <span>0% Virgin</span>
                <span>45% Blended</span>
                <span>90% High Circularity</span>
              </div>
            </div>

            {/* Slider 3: Waste Diversion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-carbon-critical" />
                  <span>Waste Diversion & Upcycling</span>
                </span>
                <span className="font-mono text-carbon-critical font-bold text-sm bg-industrial-950 px-2 py-0.5 rounded border border-industrial-800">
                  {wasteRecPct}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={wasteRecPct}
                onChange={(e) => setWasteRecPct(parseInt(e.target.value))}
                className="w-full h-2 bg-industrial-950 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-industrial-500 font-mono">
                <span>0% Landfill</span>
                <span>50% Segregated</span>
                <span>100% Zero-to-Landfill</span>
              </div>
            </div>

            {/* Slider 4: Logistics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-carbon-lime" />
                  <span>Logistics & Route Density</span>
                </span>
                <span className="font-mono text-carbon-lime font-bold text-sm bg-industrial-950 px-2 py-0.5 rounded border border-industrial-800">
                  {transportRedPct}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={transportRedPct}
                onChange={(e) => setTransportRedPct(parseInt(e.target.value))}
                className="w-full h-2 bg-industrial-950 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-industrial-500 font-mono">
                <span>0% Baseline</span>
                <span>25% Local Sourcing</span>
                <span>50% Fleet EV</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulated Impact Cards & Graph (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {simResult && (
            <>
              {/* Dynamic Result KPIs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-industrial-900 border border-carbon-green/40 shadow-glow-green">
                  <span className="text-industrial-400 block text-[10px] font-mono uppercase">CO₂ Avoided</span>
                  <div className="text-xl font-extrabold text-carbon-green font-mono">
                    {simResult.avoided_co2e_t} <span className="text-xs font-normal">t/yr</span>
                  </div>
                  <span className="text-[11px] text-carbon-lime font-bold font-mono">
                    ↓ {simResult.reduction_percentage}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800">
                  <span className="text-industrial-400 block text-[10px] font-mono uppercase">Estimated CAPEX</span>
                  <div className="text-xl font-extrabold text-white font-mono">
                    ₹{(simResult.estimated_capex_inr / 100000).toFixed(1)} <span className="text-xs font-normal">Lakh</span>
                  </div>
                  <span className="text-[11px] text-industrial-400 font-mono">One-time Investment</span>
                </div>

                <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800">
                  <span className="text-industrial-400 block text-[10px] font-mono uppercase">Annual Savings</span>
                  <div className="text-xl font-extrabold text-carbon-lime font-mono">
                    ₹{(simResult.estimated_annual_savings_inr / 100000).toFixed(1)} <span className="text-xs font-normal">Lakh/yr</span>
                  </div>
                  <span className="text-[11px] text-industrial-400 font-mono">OPEX displacement</span>
                </div>

                <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800">
                  <span className="text-industrial-400 block text-[10px] font-mono uppercase">Payback Period</span>
                  <div className="text-xl font-extrabold text-white font-mono">
                    {simResult.payback_months} <span className="text-xs font-normal">mos</span>
                  </div>
                  <span className="text-[11px] text-carbon-green font-mono">High Economic Feasibility</span>
                </div>
              </div>

              {/* Circularity Score Impact Strip */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-industrial-900 via-industrial-850 to-industrial-900 border border-carbon-cyber/40 flex items-center justify-between shadow-glow-cyber">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-carbon-cyber/20 text-carbon-cyber flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono uppercase">Circularity Score Trajectory</h4>
                    <p className="text-[11px] text-industrial-300">
                      Baseline: <span className="font-mono font-semibold">{simResult.baseline_circularity_score}/100</span> → Simulated:{" "}
                      <span className="font-mono font-bold text-carbon-green">{simResult.new_circularity_score}/100</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-carbon-green font-mono">
                    +{simResult.circularity_delta} pts
                  </span>
                  <span className="block text-[10px] text-industrial-400 font-mono uppercase">Gain</span>
                </div>
              </div>

              {/* Comparative Before vs After Bar Chart */}
              <div className="p-6 rounded-2xl bg-industrial-900/80 border border-industrial-800 shadow-card-dark">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-carbon-green" />
                    <span>Emissions Reduction Trajectory (Baseline vs Simulated Pathway)</span>
                  </h3>
                </div>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="metric" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}t`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(val: any) => [`${val} tCO₂e`, ""]}
                      />
                      <Legend />
                      <Bar dataKey="Baseline" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Simulated" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Summary Banner */}
              <div className="p-4 rounded-xl bg-industrial-950/80 border border-industrial-800 text-xs text-industrial-300 leading-relaxed">
                <span className="font-semibold text-carbon-green font-mono block mb-1">
                  Simulation Intelligence Takeaway:
                </span>
                {simResult.summary_message}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
