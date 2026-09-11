import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Flame, 
  Lightbulb, 
  TrendingDown, 
  Sliders, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Building2,
  ChevronRight,
  UserPlus,
  Lock,
  CheckCircle2,
  Users,
  FileCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: "Factory Owner",
      name: "Rajesh Patel",
      email: "rajesh.patel@carboncopilot.ai",
      password: "RajeshPatel@Carbon2026!",
      description: "Full operational control over facility, hotspot audits & what-if simulations.",
      tag: "Recommended for Judges",
      badgeColor: "border-carbon-green text-carbon-green bg-carbon-green/10",
      targetPath: "/dashboard"
    },
    {
      role: "Sustainability Consultant",
      name: "Priya Shah",
      email: "priya.shah@carboncopilot.ai",
      password: "PriyaShah@Carbon2026!",
      description: "ESG advisory, decarbonization roadmap formulation & multi-facility analytics.",
      tag: "Assigned Facility Access",
      badgeColor: "border-carbon-cyber text-carbon-cyber bg-carbon-cyber/10",
      targetPath: "/dashboard"
    },
    {
      role: "Regulator / Auditor",
      name: "Amit Desai",
      email: "amit.desai@carboncopilot.ai",
      password: "AmitDesai@Carbon2026!",
      description: "Strictly READ-ONLY compliance verification & audit report PDF downloads.",
      tag: "Enforced Read-Only",
      badgeColor: "border-amber-400 text-amber-300 bg-amber-500/10",
      targetPath: "/dashboard"
    },
    {
      role: "System Admin",
      name: "Arjun Mehta",
      email: "arjun.mehta@carboncopilot.ai",
      password: "ArjunMehta@Carbon2026!",
      description: "Platform governance, user provisioning, emission factor library & audit trail.",
      tag: "Global Governance",
      badgeColor: "border-purple-400 text-purple-300 bg-purple-500/10",
      targetPath: "/admin/users"
    }
  ];

  const handleQuickLogin = async (acc: typeof demoAccounts[0]) => {
    try {
      setLoggingInRole(acc.role);
      await login(acc.email, acc.password);
      navigate(acc.targetPath);
    } catch (err) {
      console.error("Quick login failed:", err);
      // Fallback navigate to login page
      navigate(`/login?email=${encodeURIComponent(acc.email)}`);
    } finally {
      setLoggingInRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid text-white flex flex-col selection:bg-carbon-green selection:text-industrial-950">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-industrial-800/80 px-6 lg:px-12 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-industrial-950/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-carbon-emerald via-carbon-green to-carbon-lime p-0.5 shadow-glow-green">
            <div className="w-full h-full bg-industrial-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-carbon-green" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-white font-mono text-base">CARBONCOPILOT</span>
              <span className="bg-carbon-green/20 text-carbon-green text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border border-carbon-green/40">AI</span>
            </div>
            <p className="text-[10px] text-industrial-400 font-mono tracking-wider uppercase">HackOut'26 Official Solution</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/register"
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-industrial-850 border border-industrial-700 text-carbon-green hover:border-carbon-green transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </Link>
          <Link
            to="/login"
            className="text-xs px-4 py-2 rounded-lg bg-carbon-green text-industrial-950 font-semibold hover:bg-carbon-lime transition-all shadow-glow-green"
          >
            Operator Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-16 max-w-6xl mx-auto text-center">
        {/* HackOut Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-carbon-green/10 border border-carbon-green/30 text-carbon-green text-xs font-mono mb-6">
          <span className="w-2 h-2 rounded-full bg-carbon-green animate-ping"></span>
          <span>Industrial Emission Leak-Point Detector & Circular Recommender</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
          Turn Industrial Emissions <br />
          <span className="bg-gradient-to-r from-carbon-green via-emerald-300 to-carbon-lime bg-clip-text text-transparent">
            Into Verified Action.
          </span>
        </h1>

        <p className="text-industrial-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          CarbonCopilot AI identifies where your factory's carbon emissions leak, explains why they happen, and delivers high-ROI circular alternatives with exact CO₂ cuts and payback periods.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-carbon-green text-industrial-950 font-bold hover:bg-carbon-lime transition-all shadow-glow-green flex items-center justify-center space-x-2 text-sm"
          >
            <span>Launch Demo Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-industrial-900 border border-industrial-700 text-white font-semibold hover:bg-industrial-850 hover:border-carbon-green transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>Register Facility / Join</span>
            <Sparkles className="w-4 h-4 text-carbon-green" />
          </Link>
        </div>

        {/* 1-CLICK DEMO LOGIN CARD (FOR JUDGES & EVALUATORS) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-industrial-900/90 border border-carbon-green/40 shadow-glow-green text-left mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-industrial-800">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-carbon-green mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>One-Click Role Authentication (Demo Ready)</span>
              </div>
              <h2 className="text-xl font-bold text-white">Experience All 4 Personas Live</h2>
            </div>
            <span className="text-xs font-mono text-industrial-400">
              Facility: <strong className="text-white">Shree Gujarat Textile Works Pvt. Ltd.</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {demoAccounts.map((acc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-industrial-950/80 border border-industrial-800 flex flex-col justify-between hover:border-industrial-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold text-industrial-400 uppercase">
                      {acc.role}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${acc.badgeColor}`}>
                      {acc.tag}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-0.5">{acc.name}</h4>
                  <p className="text-[11px] font-mono text-carbon-green/80 truncate mb-2">{acc.email}</p>
                  <p className="text-[11px] text-industrial-400 leading-relaxed mb-4 min-h-[44px]">
                    {acc.description}
                  </p>
                </div>

                <button
                  onClick={() => handleQuickLogin(acc)}
                  disabled={loggingInRole !== null}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    acc.role === "Factory Owner"
                      ? "bg-carbon-green text-industrial-950 hover:bg-carbon-lime shadow-glow-green"
                      : "bg-industrial-850 hover:bg-industrial-800 text-white border border-industrial-700 hover:border-carbon-green"
                  }`}
                >
                  {loggingInRole === acc.role ? (
                    <span className="animate-pulse">Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In as {acc.name.split(" ")[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Transition Graphic: CURRENT -> AI -> CIRCULAR */}
        <div className="p-6 rounded-2xl bg-industrial-900/80 border border-industrial-700/60 shadow-card-dark mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-xl bg-industrial-950/60 border border-industrial-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-industrial-400 uppercase font-semibold">Step 01 • Factory Telemetry</span>
                <Building2 className="w-4 h-4 text-industrial-400" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Operational Activity Data</h3>
              <p className="text-xs text-industrial-400 leading-relaxed">
                Ingests grid power, fuels, raw materials, waste streams, and freight logistics via our streamlined intake engine.
              </p>
              <div className="mt-4 pt-3 border-t border-industrial-800 text-[11px] font-mono text-carbon-amber">
                Baseline: 23,005.74 tCO₂e/yr
              </div>
            </div>

            <div className="p-5 rounded-xl bg-industrial-950/60 border border-carbon-green/40 shadow-glow-green">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-carbon-green uppercase font-semibold">Step 02 • AI Diagnosis</span>
                <Flame className="w-4 h-4 text-carbon-green" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Leak-Point Detection</h3>
              <p className="text-xs text-industrial-400 leading-relaxed">
                Isolation Forest and CEA/IPCC emission factor engines pinpoint critical process leaks and benchmark anomalies.
              </p>
              <div className="mt-4 pt-3 border-t border-industrial-800 text-[11px] font-mono text-carbon-green">
                Hotspot: Virgin Cotton (59.3%) & Grid (18.8%)
              </div>
            </div>

            <div className="p-5 rounded-xl bg-industrial-950/60 border border-industrial-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-industrial-400 uppercase font-semibold">Step 03 • Circular Future</span>
                <Lightbulb className="w-4 h-4 text-carbon-lime" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Costed Alternatives</h3>
              <p className="text-xs text-industrial-400 leading-relaxed">
                Recommends verified circular interventions with live What-If sliders, CAPEX, annual savings, and payback periods.
              </p>
              <div className="mt-4 pt-3 border-t border-industrial-800 text-[11px] font-mono text-carbon-lime">
                Saves: ₹3.10 Crore/yr | Cuts: 4,867 tCO₂e/yr
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars: Detect, Recommend, Reduce */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-industrial-900/50 border border-industrial-800">
            <div className="w-10 h-10 rounded-xl bg-carbon-critical/15 text-carbon-critical flex items-center justify-center mb-4 border border-carbon-critical/30">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Detect</h4>
            <p className="text-sm text-industrial-400 leading-relaxed">
              Find where emissions originate across Scope 1 direct fuel, Scope 2 grid electricity, and Scope 3 supply chain inputs with statistical leak anomaly detection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-industrial-900/50 border border-industrial-800">
            <div className="w-10 h-10 rounded-xl bg-carbon-cyber/15 text-carbon-cyber flex items-center justify-center mb-4 border border-carbon-cyber/30">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Recommend</h4>
            <p className="text-sm text-industrial-400 leading-relaxed">
              Match your facility against a curated knowledge base of circular economy interventions with multi-attribute feasibility and financial scoring.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-industrial-900/50 border border-industrial-800">
            <div className="w-10 h-10 rounded-xl bg-carbon-green/15 text-carbon-green flex items-center justify-center mb-4 border border-carbon-green/30">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Reduce & Simulate</h4>
            <p className="text-sm text-industrial-400 leading-relaxed">
              Adjust reactive sliders to simulate solar adoption, recycled material ratios, and waste recovery. See instantaneous updates to CO₂e and rupee savings.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-industrial-800/60 py-8 px-6 text-center text-xs text-industrial-500 font-mono">
        <p>CarbonCopilot AI • HackOut'26 • Industrial Emission Leak-Point Detector & Circular Alternative Recommender</p>
      </footer>
    </div>
  );
};
