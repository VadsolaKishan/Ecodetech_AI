import React, { useState } from "react";
import { Factory, Zap, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { demoApi } from "../services/api";

interface DemoBannerProps {
  onFactoryLoaded: (assessmentId: number) => void;
  activeFactoryName?: string;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onFactoryLoaded, activeFactoryName }) => {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const factories = [
    { id: 1, name: "Surat Eco-Weave Textiles", tag: "Textiles • Coal & Electricity" },
    { id: 2, name: "Punjab Agro-Foods Ltd", tag: "Food Processing • Methane Leak" },
    { id: 3, name: "GreenPack Polymer Solutions", tag: "Packaging • Virgin Resins" },
  ];

  const handleSelectFactory = async (id: number) => {
    try {
      setLoadingId(id);
      const res = await demoApi.loadFactory(id);
      if (res.assessment_id) {
        onFactoryLoaded(res.assessment_id);
      }
    } catch (err) {
      console.error("Failed to load demo factory", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-industrial-900 via-industrial-850 to-industrial-900 border-b border-industrial-700/60 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center space-x-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-carbon-green opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-carbon-green"></span>
        </span>
        <span className="font-mono font-semibold uppercase tracking-wider text-carbon-green flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> HackOut'26 Demo Bar
        </span>
        <span className="text-industrial-400 hidden sm:inline">| Quick Switch Factory Profile:</span>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
        {factories.map((f) => {
          const isActive = activeFactoryName?.toLowerCase().includes(f.name.toLowerCase().slice(0, 10));
          return (
            <button
              key={f.id}
              onClick={() => handleSelectFactory(f.id)}
              disabled={loadingId !== null}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1.5 font-medium border ${
                isActive
                  ? "bg-carbon-green/20 border-carbon-green text-carbon-green shadow-glow-green"
                  : "bg-industrial-800/80 border-industrial-700 text-industrial-300 hover:text-white hover:border-industrial-600"
              }`}
            >
              <Factory className="w-3 h-3" />
              <span>{f.name.split(" ")[0]} ({f.name.split(" ")[1]})</span>
              {loadingId === f.id && <span className="animate-spin text-xs">⟳</span>}
              {isActive && <CheckCircle2 className="w-3 h-3 text-carbon-green" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
