import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../types/roles";

export const ForbiddenPage: React.FC<{ message?: string }> = ({ message }) => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-industrial-900/90 border border-rose-500/30 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6 text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-mono rounded-full uppercase tracking-wider font-semibold">
          Error 403: Forbidden
        </span>
        <h1 className="text-2xl font-bold text-white mt-4 mb-2">Access Denied</h1>
        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
          {message || "Your current account role does not have authorization to view or modify this resource under the EcoDetect AI RBAC security policy."}
        </p>

        <div className="bg-industrial-950/80 border border-industrial-800 rounded-xl p-3 mb-6 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Current Role:</span>
          <span className="text-rose-400 font-bold px-2 py-0.5 bg-rose-950/60 border border-rose-800/60 rounded">
            {ROLE_LABELS[role] || role}
          </span>
        </div>

        <div className="flex gap-3">
          <Link
            to={role === "ADMIN" ? "/admin" : "/dashboard"}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-carbon-green text-industrial-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
