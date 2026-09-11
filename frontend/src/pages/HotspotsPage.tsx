import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, AlertTriangle, Sliders, ArrowRight, Sparkles, Filter, Info, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { analysisApi, dashboardApi } from "../services/api";
import { Hotspot } from "../types";

interface HotspotsPageProps {
  activeAssessmentId?: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#EF4444",
  High: "#F59E0B",
  Medium: "#3B82F6",
  Low: "#10B981",
};

export const HotspotsPage: React.FC<HotspotsPageProps> = ({ activeAssessmentId }) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchHotspots = async () => {
    try {
      if (hotspots.length === 0) {
        setLoading(true);
      }
      const targetId = activeAssessmentId || parseInt(localStorage.getItem("carbon_active_assessment") || "0");
      const data = await analysisApi.getHotspots(targetId, true);
      if (data && Array.isArray(data)) {
        setHotspots(data);
      }
    } catch (err) {
      console.error("Failed to load hotspots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, [activeAssessmentId]);

  const filteredHotspots = selectedFilter === "all"
    ? hotspots
    : hotspots.filter((h) => h.severity.toLowerCase() === selectedFilter.toLowerCase());

  const chartData = hotspots.map((h) => ({
    name: h.source_name.length > 22 ? h.source_name.slice(0, 22) + "..." : h.source_name,
    percentage: h.percentage_contribution,
    emissions: h.emissions_kg_co2e,
    severity: h.severity,
  }));

  if (loading && hotspots.length === 0) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-carbon-critical border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-industrial-400">Pinpointing facility emission leaks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 space-y-6 max-w-7xl mx-auto text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-carbon-critical mb-1">
            <Flame className="w-4 h-4" />
            <span>AI Leak-Point Detector • Isolation Forest & CEA Factor Model</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Facility Emission Hotspots</h1>
          <p className="text-xs text-industrial-400 mt-1">
            Ranked by emission volume, percentage contribution, and economic decarbonization leverage.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        {hotspots.length > 0 && (
          <div className="flex items-center space-x-1.5 p-1 bg-industrial-900 rounded-xl border border-industrial-800 text-xs">
            {["all", "Critical", "High", "Medium", "Low"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize font-medium ${
                  selectedFilter.toLowerCase() === lvl.toLowerCase()
                    ? "bg-industrial-800 text-white shadow-sm border border-industrial-700"
                    : "text-industrial-400 hover:text-white"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      {hotspots.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-industrial-900/80 border border-industrial-800 shadow-card-dark space-y-4">
          <div className="w-12 h-12 rounded-full bg-industrial-800 flex items-center justify-center mx-auto text-industrial-400">
            <Flame className="w-6 h-6 text-carbon-critical opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Emission Hotspots Found</h3>
            <p className="text-xs text-industrial-400 max-w-md mx-auto">
              You haven't run a carbon assessment for this facility yet, or all operational emissions are currently within baseline thresholds.
            </p>
          </div>
          <Link
            to="/assessment/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-carbon-green text-industrial-950 font-bold text-xs hover:bg-carbon-lime transition shadow-glow-green"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run New Carbon Assessment</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Top Chart Visualization */}
          <div className="p-6 rounded-2xl bg-industrial-900/80 border border-industrial-800 shadow-card-dark">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-carbon-critical" />
                <span>Emission Source Contribution Ranking (% of Total Footprint)</span>
              </h3>
              <span className="text-xs text-industrial-400 font-mono">
                Critical Threshold: &gt;30%
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                  <XAxis type="number" unit="%" stroke="#64748B" fontSize={11} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={170} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% (${item.payload.emissions.toLocaleString()} kg CO₂e)`,
                      "Share",
                    ]}
                  />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity] || "#10B981"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hotspots Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHotspots.map((h, idx) => (
              <div
                key={h.id}
                className={`p-5 rounded-2xl bg-industrial-900/80 border transition-all ${
                  h.severity === "Critical"
                    ? "border-carbon-critical/50 hover:border-carbon-critical shadow-glow-critical"
                    : h.severity === "High"
                    ? "border-amber-500/40 hover:border-amber-500"
                    : "border-industrial-800 hover:border-industrial-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-mono text-industrial-400">HOTSPOT #{idx + 1}</span>
                      <span className="text-[10px] font-mono text-industrial-500">• {h.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-white">{h.source_name}</h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        h.severity === "Critical"
                          ? "bg-carbon-critical/20 text-carbon-critical border border-carbon-critical/30"
                          : h.severity === "High"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {h.severity} • {h.percentage_contribution}%
                    </span>
                    {h.anomaly_detected && (
                      <span className="text-[9px] font-mono text-carbon-critical bg-carbon-critical/10 px-1.5 py-0.5 rounded flex items-center gap-1 border border-carbon-critical/20">
                        <ShieldAlert className="w-3 h-3" /> Anomaly Leak
                      </span>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs text-industrial-300 leading-relaxed my-3 bg-industrial-950/50 p-3 rounded-xl border border-industrial-850">
                  {h.explanation}
                </p>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-industrial-800 text-[11px] font-mono text-industrial-400">
                  <div>
                    <span className="text-industrial-500 block text-[10px]">Emissions</span>
                    <span className="text-white font-bold">{h.emissions_kg_co2e.toLocaleString()} kg CO₂e</span>
                  </div>
                  <div>
                    <span className="text-industrial-500 block text-[10px]">Hotspot Priority Score</span>
                    <span className="text-carbon-green font-bold">{h.hotspot_score} / 100</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-4 pt-2 flex items-center justify-end">
                  <Link
                    to="/simulator"
                    className="text-xs font-semibold text-carbon-green hover:underline flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" /> Simulate Decarbonization <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
