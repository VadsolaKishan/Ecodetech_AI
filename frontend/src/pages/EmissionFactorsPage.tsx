import React, { useState, useEffect } from "react";
import { Database, Plus, Search, Filter, RefreshCw, CheckCircle2, Shield } from "lucide-react";
import { adminApi } from "../services/api";
import { EmissionFactorItem } from "../types";
import { useAuth } from "../context/AuthContext";
import { PermissionGuard } from "../components/PermissionGuard";

export const EmissionFactorsPage: React.FC = () => {
  const { role, isReadOnly } = useAuth();
  const [factors, setFactors] = useState<EmissionFactorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal state for Admin adding new factor
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "energy",
    activity: "",
    unit: "kWh",
    factor: 0.82,
    factor_unit: "kg CO2e/unit",
    source: "IPCC AR6 / CEA v19",
    region: "India",
    year: 2024,
    confidence_level: "High",
    version: "1.0",
  });

  const fetchFactors = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getEmissionFactors();
      setFactors(data || []);
    } catch (err) {
      console.error("Failed to load emission factors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactors();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createEmissionFactor(formData);
      setIsModalOpen(false);
      fetchFactors();
    } catch (err) {
      alert("Failed to create emission factor");
    }
  };

  const filteredFactors = factors.filter((f) => {
    const matchesCat = !categoryFilter || f.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      f.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.source || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-industrial-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                Emission Factor Repository
                {isReadOnly && (
                  <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    READ ONLY — REGULATOR / AUDITOR
                  </span>
                )}
              </h1>
              <p className="text-slate-400 text-sm">
                Standardized, peer-reviewed emission factors from IPCC AR6, CEA India Baseline v19, and DEFRA for GHG Protocol calculations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PermissionGuard requireWrite={true} allowedRoles={["ADMIN"]}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-carbon-green text-industrial-950 font-bold text-sm rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-carbon-green/20"
            >
              <Plus className="w-4 h-4" /> Add Emission Factor
            </button>
          </PermissionGuard>

          <button
            onClick={fetchFactors}
            className="p-2 bg-industrial-900 border border-industrial-700 rounded-xl text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-industrial-900/60 border border-industrial-800 p-4 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search activity or source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-industrial-950/80 border border-industrial-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-carbon-green"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-industrial-950/80 border border-industrial-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-carbon-green"
          >
            <option value="">All Categories</option>
            <option value="energy">Energy Sources</option>
            <option value="materials">Materials & Chemicals</option>
            <option value="waste">Waste Streams</option>
            <option value="transport">Freight & Transport</option>
          </select>
        </div>

        <div className="flex items-center text-xs text-slate-400 font-mono pl-2">
          {filteredFactors.length} verified emission factors loaded
        </div>
      </div>

      {/* Table */}
      <div className="bg-industrial-900/60 border border-industrial-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-industrial-950/90 text-xs font-mono uppercase text-slate-400 border-b border-industrial-800">
              <tr>
                <th className="py-3.5 px-4">Activity Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Factor Value</th>
                <th className="py-3.5 px-4">Unit</th>
                <th className="py-3.5 px-4">Source Standard</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/60 font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-carbon-green" />
                    Loading emission factors...
                  </td>
                </tr>
              ) : filteredFactors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching emission factors found.
                  </td>
                </tr>
              ) : (
                filteredFactors.map((f) => (
                  <tr key={f.id} className="hover:bg-industrial-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-200 font-medium whitespace-nowrap">
                      {f.activity}
                    </td>
                    <td className="py-3 px-4 uppercase text-slate-400">
                      {f.category}
                    </td>
                    <td className="py-3 px-4 font-bold text-carbon-green text-sm">
                      {f.factor}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {f.factor_unit}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {f.source} ({f.year})
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[10px] font-semibold">
                        {f.confidence_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      v{f.version || "1.0"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Factor Modal (Admin only) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-industrial-900 border border-industrial-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Add Standard Emission Factor</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="energy">Energy</option>
                  <option value="materials">Materials</option>
                  <option value="waste">Waste</option>
                  <option value="transport">Transport</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grid Electricity (Tamil Nadu)"
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Factor (kg CO2e)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.factor}
                    onChange={(e) => setFormData({ ...formData, factor: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Activity Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Source & Year</label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-industrial-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-industrial-800 hover:bg-industrial-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-carbon-green hover:bg-emerald-400 text-industrial-950 font-bold rounded-xl"
                >
                  Save Factor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
