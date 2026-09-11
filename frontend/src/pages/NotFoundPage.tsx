import React from "react";
import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-industrial-900/90 border border-slate-700/40 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-6 text-slate-400">
          <Compass className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-full uppercase tracking-wider font-semibold">
          Error 404: Not Found
        </span>
        <h1 className="text-2xl font-bold text-white mt-4 mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          The requested operational module or route does not exist in the CarbonCopilot platform registry.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-carbon-green text-industrial-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors"
        >
          <Home className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
