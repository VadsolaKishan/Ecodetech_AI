import React, { useState, useEffect } from "react";
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar, 
  CircleDollarSign, 
  TrendingDown, 
  Trash, 
  X,
  Sparkles
} from "lucide-react";
import { actionPlanApi, dashboardApi } from "../services/api";
import { ActionPlanItem } from "../types";

interface ActionPlanPageProps {
  activeAssessmentId?: number;
  activeFactoryName?: string;
}

export const ActionPlanPage: React.FC<ActionPlanPageProps> = ({ activeAssessmentId, activeFactoryName }) => {
  const [assessmentId, setAssessmentId] = useState<number | null>(() => {
    return activeAssessmentId !== undefined ? activeAssessmentId : null;
  });
  const [actions, setActions] = useState<ActionPlanItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // New action form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Energy");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("High");
  const [newOwner, setNewOwner] = useState("Factory Operations Team");
  const [newDeadline, setNewDeadline] = useState("Q3 2026");
  const [newCost, setNewCost] = useState(250000);
  const [newCo2Cut, setNewCo2Cut] = useState(15000);

  const fetchActions = async (targetId?: number) => {
    const id = targetId !== undefined ? targetId : (activeAssessmentId || assessmentId);
    if (!id) {
      setActions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await actionPlanApi.list(id);
      setActions(data || []);
    } catch (err) {
      console.error(err);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAssessmentId(activeAssessmentId !== undefined ? activeAssessmentId : null);
    if (activeAssessmentId) {
      fetchActions(activeAssessmentId);
    } else {
      setActions([]);
    }
  }, [activeAssessmentId]);

  const handleStatusChange = async (actionId: number, nextStatus: "Planned" | "In Progress" | "Completed") => {
    try {
      await actionPlanApi.update(actionId, { status: nextStatus });
      setActions(actions.map((a) => (a.id === actionId ? { ...a, status: nextStatus } : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (actionId: number) => {
    try {
      await actionPlanApi.delete(actionId);
      setActions(actions.filter((a) => a.id !== actionId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentId) return;
    try {
      const created = await actionPlanApi.create(assessmentId, {
        title: newTitle,
        category: newCategory,
        priority: newPriority,
        owner: newOwner,
        deadline: newDeadline,
        estimated_cost_inr: newCost,
        expected_co2_reduction_kg: newCo2Cut,
        status: "Planned",
      });
      setActions([created, ...actions]);
      setShowModal(false);
      setNewTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  // Rollup totals
  const totalCost = actions.reduce((acc, a) => acc + (a.estimated_cost_inr || 0), 0);
  const totalCo2T = actions.reduce((acc, a) => acc + (a.expected_co2_reduction_kg || 0), 0) / 1000.0;
  const completedCount = actions.filter((a) => a.status === "Completed").length;

  const columns: Array<{ status: "Planned" | "In Progress" | "Completed"; title: string; color: string }> = [
    { status: "Planned", title: "Planned Pipeline", color: "text-carbon-cyber" },
    { status: "In Progress", title: "Active Implementation", color: "text-carbon-amber" },
    { status: "Completed", title: "Verified & Complete", color: "text-carbon-green" },
  ];

  return (
    <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-carbon-green mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Operational Roadmap • Traceable Decarbonization Execution</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Decarbonization Action Roadmap</h1>
          <p className="text-xs text-industrial-400 mt-1">
            Track implementation milestones, assigned plant champions, capital allocations, and realized CO₂ cuts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold flex items-center space-x-1.5 shadow-glow-green"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Action</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800">
          <span className="text-industrial-400 block text-[10px] font-mono uppercase">Committed Decarbonization</span>
          <div className="text-2xl font-extrabold text-carbon-green font-mono">
            {totalCo2T.toFixed(1)} <span className="text-xs font-normal text-industrial-400">tCO₂e Target</span>
          </div>
          <span className="text-[11px] text-industrial-400 font-mono">Across {actions.length} committed actions</span>
        </div>

        <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800">
          <span className="text-industrial-400 block text-[10px] font-mono uppercase">Total Committed CAPEX</span>
          <div className="text-2xl font-extrabold text-white font-mono">
            ₹{(totalCost / 100000).toFixed(2)} <span className="text-xs font-normal text-industrial-400">Lakh</span>
          </div>
          <span className="text-[11px] text-industrial-400 font-mono">Budgeted implementation</span>
        </div>

        <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-800">
          <span className="text-industrial-400 block text-[10px] font-mono uppercase">Execution Progress</span>
          <div className="text-2xl font-extrabold text-carbon-lime font-mono">
            {actions.length > 0 ? Math.round((completedCount / actions.length) * 100) : 0}%
          </div>
          <span className="text-[11px] text-carbon-green font-mono">{completedCount} of {actions.length} completed</span>
        </div>
      </div>

      {/* Empty State Notice */}
      {actions.length === 0 && (
        <div className="p-8 text-center rounded-2xl bg-industrial-900/60 border border-industrial-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-industrial-950 border border-industrial-800 text-carbon-green flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6 text-industrial-400" />
          </div>
          <h3 className="text-base font-bold text-white">No actions added yet</h3>
          <p className="text-xs text-industrial-400 max-w-sm mx-auto">
            Convert high-ROI circular recommendations into trackable milestones or click 'Add Custom Action' to schedule decarbonization tasks.
          </p>
        </div>
      )}

      {/* Kanban Style Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col) => {
          const items = actions.filter((a) => a.status === col.status);
          return (
            <div key={col.status} className="p-4 rounded-2xl bg-industrial-900/60 border border-industrial-800 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-industrial-800">
                <h3 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${col.color}`}>
                  <span>{col.title}</span>
                </h3>
                <span className="text-[10px] font-mono bg-industrial-800 px-2 py-0.5 rounded text-industrial-300 font-semibold">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-xs text-industrial-500 font-mono">
                    No actions in {col.status}
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-industrial-950/80 border border-industrial-800 hover:border-industrial-700 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-industrial-900 text-industrial-300 border border-industrial-800">
                          {item.category}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                              item.priority === "High"
                                ? "bg-carbon-critical/20 text-carbon-critical"
                                : item.priority === "Medium"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {item.priority}
                          </span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-industrial-500 hover:text-carbon-critical p-0.5"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>

                      <div className="space-y-1 text-[11px] text-industrial-400 font-mono pt-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-industrial-500" /> {item.owner}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-industrial-500" /> {item.deadline}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-white font-semibold">
                          <span>₹{(item.estimated_cost_inr / 100000).toFixed(1)} Lakh</span>
                          <span className="text-carbon-green">↓ {(item.expected_co2_reduction_kg / 1000).toFixed(1)} tCO₂e</span>
                        </div>
                      </div>

                      {/* Status quick toggle buttons */}
                      <div className="pt-2 border-t border-industrial-900 flex items-center justify-between text-[10px]">
                        {col.status !== "Planned" && (
                          <button
                            onClick={() => handleStatusChange(item.id, "Planned")}
                            className="text-industrial-400 hover:text-white"
                          >
                            ← Move Planned
                          </button>
                        )}
                        {col.status !== "In Progress" && (
                          <button
                            onClick={() => handleStatusChange(item.id, "In Progress")}
                            className="text-amber-400 hover:text-amber-300 font-medium"
                          >
                            Set In Progress
                          </button>
                        )}
                        {col.status !== "Completed" && (
                          <button
                            onClick={() => handleStatusChange(item.id, "Completed")}
                            className="text-carbon-green hover:text-carbon-lime font-bold ml-auto"
                          >
                            ✓ Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Action Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-industrial-900 border border-industrial-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-industrial-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-carbon-green" /> Add Custom Decarbonization Action
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-industrial-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-3">
              <div>
                <label className="block text-[11px] text-industrial-400 mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Install IE4 Premium Motors on Spinning Line"
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-industrial-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-2 text-xs text-white"
                  >
                    <option value="Energy">Energy & Clean Power</option>
                    <option value="Materials">Circular Materials</option>
                    <option value="Waste">Waste Diversion</option>
                    <option value="Transport">Green Logistics</option>
                    <option value="Process">Process Efficiency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-industrial-400 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-2 text-xs text-white"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-industrial-400 mb-1">Lead Owner</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-industrial-400 mb-1">Target Deadline</label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-industrial-400 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-industrial-400 mb-1">Expected CO₂ Cut (kg)</label>
                  <input
                    type="number"
                    value={newCo2Cut}
                    onChange={(e) => setNewCo2Cut(parseFloat(e.target.value) || 0)}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-industrial-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-industrial-800 text-industrial-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-carbon-green text-industrial-950 hover:bg-carbon-lime text-xs font-bold shadow-glow-green"
                >
                  Add to Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
