import React from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-industrial-900/90 border border-amber-500/30 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-mono rounded-full uppercase tracking-wider font-semibold">
          Error 401: Unauthorized
        </span>
        <h1 className="text-2xl font-bold text-white mt-4 mb-2">Authentication Required</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          You must be logged in to access this carbon intelligence module. Please log in with your authorized industrial credentials.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-carbon-green text-industrial-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-carbon-green/20"
        >
          Sign In Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
