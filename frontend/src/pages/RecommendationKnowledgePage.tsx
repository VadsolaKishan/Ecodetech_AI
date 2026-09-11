import React, { useState, useEffect } from "react";
import { Lightbulb, Plus, Search, RefreshCw, CheckCircle2, Shield } from "lucide-react";
import { adminApi } from "../services/api";
import { RecommendationKnowledgeItem } from "../types";
import { useAuth } from "../context/AuthContext";
import { PermissionGuard } from "../components/PermissionGuard";

export const RecommendationKnowledgePage: React.FC = () => {
  const { role, isReadOnly } = useAuth();
  const [rules, setRules] = useState<RecommendationKnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getRecommendationKnowledge();
      setRules(data || []);
    } catch (err) {
      console.error("Failed to load recommendation knowledge base", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const filteredRules = rules.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term) ||
      r.target_source.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-industrial-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-700/50 text-amber-400">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                Circular Alternatives Knowledge Base
                {isReadOnly && (
                  <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    READ ONLY — REGULATOR / AUDITOR
                  </span>
                )}
              </h1>
              <p className="text-slate-400 text-sm">
                Engineering heuristics, financial payback curves, and circularity boost models driving the AI Recommendation Engine.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchRules}
          className="p-2 bg-industrial-900 border border-industrial-700 rounded-xl text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search */}
      <div className="bg-industrial-900/60 border border-industrial-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search interventions by title, category, target source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-industrial-950/80 border border-industrial-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-carbon-green"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">
          {filteredRules.length} active circular rules
        </span>
      </div>

      {/* Knowledge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-carbon-green" />
            Loading circular engineering rules...
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500">
            No matching circular rules found.
          </div>
        ) : (
          filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="bg-industrial-900/70 border border-industrial-800 hover:border-industrial-700 rounded-2xl p-5 space-y-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-industrial-950 text-slate-400 border border-industrial-800">
                    {rule.category} • Target: {rule.target_source}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{rule.title}</h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-xl text-xs font-bold font-mono whitespace-nowrap">
                  +{rule.circularity_boost} Circ. Pts
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {rule.reason_template.replace("{pct}", "35-50")}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-industrial-800/60 text-xs font-mono">
                <div className="bg-industrial-950/80 p-2 rounded-xl border border-industrial-800/40">
                  <span className="text-slate-500 block text-[10px]">CO2 Reduction</span>
                  <span className="text-carbon-green font-bold">
                    {rule.reduction_min_pct}% - {rule.reduction_max_pct}%
                  </span>
                </div>
                <div className="bg-industrial-950/80 p-2 rounded-xl border border-industrial-800/40">
                  <span className="text-slate-500 block text-[10px]">Base Payback</span>
                  <span className="text-amber-400 font-bold">{rule.base_payback_months} mos</span>
                </div>
                <div className="bg-industrial-950/80 p-2 rounded-xl border border-industrial-800/40">
                  <span className="text-slate-500 block text-[10px]">Feasibility</span>
                  <span className="text-sky-400 font-bold">{rule.feasibility}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
