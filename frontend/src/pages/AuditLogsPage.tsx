import React, { useState, useEffect } from "react";
import { ShieldCheck, Filter, Search, Clock, UserCheck, AlertCircle, RefreshCw } from "lucide-react";
import { adminApi } from "../services/api";
import { AuditLogItem } from "../types";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS, ROLE_BADGE_COLORS, UserRole } from "../types/roles";

export const AuditLogsPage: React.FC = () => {
  const { role, isReadOnly } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    if (logs.length === 0) setLoading(true);
    try {
      const data = await adminApi.getAuditLogs(actionFilter || undefined);
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      (log.user_email || "").toLowerCase().includes(term) ||
      (log.action || "").toLowerCase().includes(term) ||
      (log.entity_type || "").toLowerCase().includes(term) ||
      (log.details || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-industrial-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-700/50 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                Security & Regulatory Audit Trail
                {isReadOnly && (
                  <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    READ ONLY — REGULATOR / AUDITOR
                  </span>
                )}
              </h1>
              <p className="text-slate-400 text-sm">
                Tamper-evident operational ledger recording logins, assessments, emission calculations, and governance changes.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-industrial-900 border border-industrial-700 hover:border-slate-500 text-slate-200 text-sm font-medium rounded-xl transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-industrial-900/60 border border-industrial-800 p-4 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by user, action, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-industrial-950/80 border border-industrial-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-carbon-green"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-industrial-950/80 border border-industrial-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-carbon-green"
          >
            <option value="">All Audit Events</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="ASSESSMENT_CREATED">ASSESSMENT_CREATED</option>
            <option value="CALCULATION_RUN">CALCULATION_RUN</option>
            <option value="RECOMMENDATION_GENERATED">RECOMMENDATION_GENERATED</option>
            <option value="SCENARIO_CREATED">SCENARIO_CREATED</option>
            <option value="ACTION_PLAN_CHANGED">ACTION_PLAN_CHANGED</option>
            <option value="REPORT_GENERATED">REPORT_GENERATED</option>
            <option value="EMISSION_FACTOR_CHANGED">EMISSION_FACTOR_CHANGED</option>
            <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
          </select>
        </div>

        <div className="flex items-center text-xs text-slate-400 font-mono pl-2">
          Displaying {filteredLogs.length} verified audit records
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-industrial-900/60 border border-industrial-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-industrial-950/90 text-xs font-mono uppercase text-slate-400 border-b border-industrial-800">
              <tr>
                <th className="py-3.5 px-4">Timestamp (UTC)</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Event Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/60 font-mono text-xs">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-carbon-green" />
                    Querying secure audit ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No matching audit log records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const roleKey = (log.role || "FACTORY_OWNER") as UserRole;
                  const colors = ROLE_BADGE_COLORS[roleKey] || ROLE_BADGE_COLORS.FACTORY_OWNER;

                  return (
                    <tr key={log.id} className="hover:bg-industrial-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-medium">
                        {log.user_email || "System Service"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${colors.bg} ${colors.text} ${colors.border}`}>
                          {log.role || "SYSTEM"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-carbon-green">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ""}
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-md truncate" title={log.details || ""}>
                        {log.details || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
