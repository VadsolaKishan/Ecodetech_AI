import React from "react";
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
  ChevronRight
} from "lucide-react";
import { demoApi } from "../services/api";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunchDemo = async (factoryId: number = 1) => {
    try {
      await demoApi.loadFactory(factoryId);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid text-white flex flex-col selection:bg-carbon-green selection:text-industrial-950">
      {/* Top Navbar */}
      <nav className="h-18 border-b border-industrial-800/80 px-6 lg:px-12 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-industrial-950/80">
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
          <button
            onClick={() => handleLaunchDemo(1)}
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-industrial-850 border border-industrial-700 text-carbon-green hover:border-carbon-green transition-all"
          >
            <span>Instant Demo (Surat Textiles)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <Link
            to="/login"
            className="text-xs px-4 py-2 rounded-lg bg-carbon-green text-industrial-950 font-semibold hover:bg-carbon-lime transition-all shadow-glow-green"
          >
            Operator Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-20 pb-16 max-w-6xl mx-auto text-center">
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

        <p className="text-industrial-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          CarbonCopilot AI identifies where your factory's carbon emissions leak, explains why they happen, and delivers high-ROI circular alternatives with exact CO₂ cuts and payback periods.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/assessment/new"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-carbon-green text-industrial-950 font-bold hover:bg-carbon-lime transition-all shadow-glow-green flex items-center justify-center space-x-2 text-sm"
          >
            <span>Start Carbon Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => handleLaunchDemo(1)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-industrial-900 border border-industrial-700 text-white font-semibold hover:bg-industrial-850 hover:border-carbon-green transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>Explore 60-Sec Demo Factory</span>
            <Sparkles className="w-4 h-4 text-carbon-green" />
          </button>
        </div>

        {/* Dynamic Transition Graphic: CURRENT -> AI -> CIRCULAR */}
        <div className="p-6 rounded-2xl bg-industrial-900/80 border border-industrial-700/60 shadow-card-dark mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-xl bg-industrial-950/60 border border-industrial-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-industrial-400 uppercase font-semibold">Step 01 • Factory Input</span>
                <Building2 className="w-4 h-4 text-industrial-400" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Operational Data</h3>
              <p className="text-xs text-industrial-400 leading-relaxed">
                Ingests energy, fuels, raw materials, waste streams, and logistics via a 5-minute guided wizard.
              </p>
              <div className="mt-4 pt-3 border-t border-industrial-800 text-[11px] font-mono text-carbon-amber">
                Baseline: 615.9 tCO₂e/month
              </div>
            </div>

            <div className="p-5 rounded-xl bg-industrial-950/60 border border-carbon-green/40 shadow-glow-green">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-carbon-green uppercase font-semibold">Step 02 • AI Diagnosis</span>
                <Flame className="w-4 h-4 text-carbon-green" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Leak-Point Detection</h3>
              <p className="text-xs text-industrial-400 leading-relaxed">
                Isolation Forest and CEA/IPCC emission factor engines pinpoint critical leaks (e.g. Coal & Virgin Polyester).
              </p>
              <div className="mt-4 pt-3 border-t border-industrial-800 text-[11px] font-mono text-carbon-green">
                Hotspot: Virgin Polyester (46.6%)
              </div>
            </div>

            <div className="p-5 rounded-xl bg-industrial-950/60 border border-industrial-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-industrial-400 uppercase font-semibold">Step 03 • Circular Future</span>
                <Lightbulb className="w-4 h-4 text-carbon-lime" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Costed Alternatives</h3>
              <p className="text-xs text-industrial-400 leading-relaxed">
                Recommends verified circular interventions with live What-If sliders, CAPEX, annual savings, and ROI.
              </p>
              <div className="mt-4 pt-3 border-t border-industrial-800 text-[11px] font-mono text-carbon-lime">
                Saves: ₹8.06 Lakh/yr | Payback: 23 mo
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
              Match your facility against a curated knowledge base of 30+ circular economy interventions with multi-attribute feasibility and financial scoring.
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
