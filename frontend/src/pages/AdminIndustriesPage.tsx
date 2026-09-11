import React, { useState, useEffect } from "react";
import { Factory, UserCheck, RefreshCw, MapPin, Building2, Shield } from "lucide-react";
import { adminApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { PermissionGuard } from "../components/PermissionGuard";

export const AdminIndustriesPage: React.FC = () => {
  const { role, isReadOnly } = useAuth();
  const [factories, setFactories] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Assign modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | null>(null);
  const [selectedConsultantId, setSelectedConsultantId] = useState<number | "">("");

  const fetchData = async () => {
    if (factories.length === 0) setLoading(true);
    try {
      const [facData, usersData] = await Promise.all([
        adminApi.getIndustries(),
        adminApi.getUsers().catch(() => [])
      ]);
      setFactories(facData || []);
      const cons = (usersData || []).filter((u: any) => u.role === "SUSTAINABILITY_CONSULTANT");
      setConsultants(cons);
    } catch (err) {
      console.error("Failed to load industries directory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactoryId || !selectedConsultantId) return;
    try {
      await adminApi.assignConsultant(Number(selectedConsultantId), selectedFactoryId);
      setIsAssignModalOpen(false);
      setSelectedConsultantId("");
      fetchData();
    } catch (err) {
      alert("Failed to assign consultant");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-industrial-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-sky-950/60 border border-sky-700/50 text-sky-400">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                Industrial Facilities Directory
                {isReadOnly && (
                  <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    READ ONLY — REGULATOR / AUDITOR
                  </span>
                )}
              </h1>
              <p className="text-slate-400 text-sm">
                Factory operational units, multi-tier manufacturing facilities, and verified consultant assignments.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="p-2 bg-industrial-900 border border-industrial-700 rounded-xl text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && factories.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-carbon-green" />
            Loading industrial facilities directory...
          </div>
        ) : (
          factories.map((fac) => (
            <div
              key={fac.id}
              className="bg-industrial-900/70 border border-industrial-800 hover:border-industrial-700 rounded-2xl p-6 space-y-4 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-industrial-950 text-sky-400 border border-sky-900/60 font-semibold">
                    {fac.industry_type}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5">{fac.company_name}</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">ID #{fac.id}</span>
              </div>

              <div className="space-y-2 text-xs text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{fac.factory_location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Output: {fac.monthly_production} {fac.production_unit}/mo</span>
                </div>
              </div>

              <div className="pt-3 border-t border-industrial-800/80">
                <div className="text-xs text-slate-400 mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-[11px]">Assigned Consultants:</span>
                  <PermissionGuard requireWrite={true} allowedRoles={["ADMIN"]}>
                    <button
                      onClick={() => {
                        setSelectedFactoryId(fac.id);
                        setIsAssignModalOpen(true);
                      }}
                      className="text-[11px] text-carbon-green hover:underline font-mono"
                    >
                      + Assign
                    </button>
                  </PermissionGuard>
                </div>
                {fac.assigned_consultants && fac.assigned_consultants.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {fac.assigned_consultants.map((cName: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/60 text-[10px] font-mono"
                      >
                        {cName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono italic">
                    No consultant assigned yet
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Modal (Admin only) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-industrial-900 border border-industrial-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Assign Sustainability Consultant</h2>
            <form onSubmit={handleAssign} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 mb-1">Select Consultant</label>
                <select
                  required
                  value={selectedConsultantId}
                  onChange={(e) => setSelectedConsultantId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="">-- Choose verified consultant --</option>
                  {consultants.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-industrial-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 bg-industrial-800 hover:bg-industrial-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-carbon-green hover:bg-emerald-400 text-industrial-950 font-bold rounded-xl"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
