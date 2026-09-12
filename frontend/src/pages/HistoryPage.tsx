import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Calendar,
  Zap,
  Flame,
  Boxes,
  Award,
  ArrowRight,
  Trash2,
  Plus,
  TrendingDown,
  CloudFog,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { assessmentApi } from "../services/api";
import { Assessment } from "../types";

interface HistoryPageProps {
  onSelectAssessment: (id: number) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectAssessment }) => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      if (assessments.length === 0) {
        setLoading(true);
      }
      const data = await assessmentApi.list();
      setAssessments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this historical assessment?")) return;
    try {
      await assessmentApi.delete(id);
      setAssessments(assessments.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = (id: number) => {
    onSelectAssessment(id);
    navigate("/dashboard");
  };

  return (
    <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-carbon-green mb-1">
            <History className="w-4 h-4" />
            <span>Audit Trail & Historical Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Assessment History & Logs</h1>
          <p className="text-xs text-industrial-400 mt-1">
            Review past carbon audits, observe footprint trends, and re-run simulations.
          </p>
        </div>

        <button
          onClick={() => navigate("/assessment/new")}
          className="px-4 py-2.5 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-green-hover text-xs font-bold flex items-center space-x-2 shadow-glow-green transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Table Card Container */}
      <div className="rounded-2xl bg-industrial-900/90 border border-industrial-800 shadow-card-dark overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-industrial-400 text-xs font-mono animate-pulse">
            Loading historical assessments...
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-16 text-industrial-400 text-xs font-mono">
            No historical assessments recorded yet. Click "New Assessment" to begin your first audit.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-industrial-950/80 border-b border-industrial-800 text-industrial-400 text-[10px] uppercase font-bold tracking-wider font-mono">
                  <th className="py-3.5 px-5 min-w-[200px]">Assessment Name</th>
                  <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Audit Date</th>
                  <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">Total Footprint</th>
                  <th className="py-3.5 px-4 min-w-[280px] whitespace-nowrap">Scope 1 / 2 / 3 Breakdown</th>
                  <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap text-center">Circularity Score</th>
                  <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Potential Reduction</th>
                  <th className="py-3.5 px-5 min-w-[110px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800/60 font-sans text-xs">
                {assessments.map((a) => {
                  const s1 = Number(a.scope1_tco2e || 0).toFixed(1);
                  const s2 = Number(a.scope2_tco2e || 0).toFixed(1);
                  const s3 = Number(a.scope3_tco2e || 0).toFixed(1);
                  const total = Number(a.total_emissions_tco2e || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 2,
                  });
                  const potential = Number(a.potential_reduction_tco2e || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 2,
                  });
                  const circScore = Number(a.circularity_score || 0).toFixed(1);

                  return (
                    <tr
                      key={a.id}
                      onClick={() => handleOpen(a.id)}
                      className="hover:bg-industrial-850/50 cursor-pointer transition-colors text-industrial-200 group"
                    >
                      {/* Column 1: Assessment Name */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-white text-sm group-hover:text-carbon-green transition-colors flex items-center gap-2">
                          <span>{a.name}</span>
                        </div>
                        <div className="text-[11px] text-industrial-500 font-mono mt-0.5">
                          ID: #{a.id} • Verified Audit
                        </div>
                      </td>

                      {/* Column 2: Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-industrial-300 font-mono text-xs">
                          <Calendar className="w-3.5 h-3.5 text-industrial-500 flex-shrink-0" />
                          <span>{new Date(a.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}</span>
                        </div>
                      </td>

                      {/* Column 3: Footprint */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-extrabold text-white font-mono">
                            {total}
                          </span>
                          <span className="text-[11px] text-industrial-400 font-medium">tCO₂e</span>
                        </div>
                      </td>

                      {/* Column 4: Scope 1 / 2 / 3 Badges */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          {/* Scope 1 */}
                          <span className="px-2 py-0.5 rounded-md bg-carbon-amber/15 text-carbon-amber border border-carbon-amber/30 flex items-center gap-1">
                            <span className="font-bold">S1:</span> {s1}t
                          </span>
                          {/* Scope 2 */}
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                            <span className="font-bold">S2:</span> {s2}t
                          </span>
                          {/* Scope 3 */}
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                            <span className="font-bold">S3:</span> {s3}t
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Circularity Score */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/70 text-cyan-400 border border-cyan-500/30 font-mono font-bold text-xs">
                          <Award className="w-3 h-3" />
                          {circScore}/100
                        </span>
                      </td>

                      {/* Column 6: Potential Reduction */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-carbon-green font-mono bg-carbon-green/10 px-2.5 py-1 rounded-lg border border-carbon-green/20">
                          <TrendingDown className="w-3.5 h-3.5" />
                          ↓ {potential} tCO₂e
                        </span>
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpen(a.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-carbon-green/15 text-carbon-green hover:bg-carbon-green hover:text-industrial-950 text-xs font-bold transition flex items-center gap-1 border border-carbon-green/30"
                          >
                            <span>Open</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(a.id, e)}
                            title="Delete Assessment"
                            className="p-1.5 rounded-lg text-industrial-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
