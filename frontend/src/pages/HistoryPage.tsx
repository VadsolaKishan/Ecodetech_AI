import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History, Calendar, Flame, Award, ArrowRight, Trash2, Plus, Sparkles } from "lucide-react";
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
      {/* Header */}
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
          className="px-4 py-2 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold flex items-center space-x-1.5 shadow-glow-green"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="p-6 rounded-2xl bg-industrial-900/80 border border-industrial-800 shadow-card-dark overflow-x-auto">
        {assessments.length === 0 ? (
          <div className="text-center py-12 text-industrial-400 text-xs font-mono">
            No historical assessments recorded yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-industrial-800 text-industrial-400 text-[11px]">
                <th className="py-3">Assessment Name</th>
                <th className="py-3">Date</th>
                <th className="py-3">Footprint (tCO₂e)</th>
                <th className="py-3">Scope 1 / 2 / 3</th>
                <th className="py-3">Circularity Score</th>
                <th className="py-3">Potential Reduction</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-850">
              {assessments.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => handleOpen(a.id)}
                  className="hover:bg-industrial-850/60 cursor-pointer transition-colors text-industrial-200 group"
                >
                  <td className="py-3.5 font-bold text-white group-hover:text-carbon-green transition-colors">
                    {a.name}
                  </td>
                  <td className="py-3.5 text-industrial-400">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 text-white font-bold">
                    {a.total_emissions_tco2e} t
                  </td>
                  <td className="py-3.5 text-industrial-300 text-[11px]">
                    S1: {a.scope1_tco2e}t | S2: {a.scope2_tco2e}t | S3: {a.scope3_tco2e}t
                  </td>
                  <td className="py-3.5">
                    <span className="text-carbon-cyber font-bold">{a.circularity_score}/100</span>
                  </td>
                  <td className="py-3.5 text-carbon-green font-semibold">
                    ↓ {a.potential_reduction_tco2e} tCO₂e
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpen(a.id)}
                      className="px-2.5 py-1 rounded bg-carbon-green/20 text-carbon-green text-[10px] font-bold hover:bg-carbon-green hover:text-industrial-950 transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={(e) => handleDelete(a.id, e)}
                      className="p-1 text-industrial-500 hover:text-carbon-critical transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
