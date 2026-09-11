import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building,
  ClipboardCheck,
  Flame,
  Lightbulb,
  Sliders,
  GitCompare,
  CheckSquare,
  FileText,
  History,
  Sparkles
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: "/dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { to: "/hotspots", label: "Emission Hotspots", icon: Flame, badge: "Leak Detector" },
    { to: "/recommendations", label: "AI Recommendations", icon: Lightbulb, badge: "Circular" },
    { to: "/simulator", label: "What-If Simulator", icon: Sliders, badge: "Killer Feature" },
    { to: "/scenarios", label: "Scenario Matrix", icon: GitCompare },
    { to: "/action-plan", label: "Action Roadmap", icon: CheckSquare },
    { to: "/assessment/new", label: "New Assessment", icon: ClipboardCheck },
    { to: "/profile", label: "Factory Profile", icon: Building },
    { to: "/reports", label: "Audit Reports", icon: FileText },
    { to: "/history", label: "Assessment History", icon: History },
  ];

  return (
    <aside className="w-64 bg-industrial-900/95 border-r border-industrial-700/60 min-h-[calc(100vh-6rem)] p-4 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-industrial-400 font-semibold">
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-carbon-green/15 text-white border border-carbon-green/40 shadow-glow-green"
                    : "text-industrial-300 hover:text-white hover:bg-industrial-800/80 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-carbon-green" : "text-industrial-400 group-hover:text-industrial-200"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        isActive
                          ? "bg-carbon-green text-industrial-950"
                          : item.badge === "Killer Feature"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-industrial-800 text-industrial-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Sustainability Trust Seal */}
      <div className="p-3 rounded-xl bg-gradient-to-b from-industrial-800/50 to-industrial-850/80 border border-industrial-700/50 text-xs">
        <div className="flex items-center space-x-1.5 text-carbon-green font-mono text-[11px] font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GHG Protocol Verified</span>
        </div>
        <p className="text-industrial-400 text-[11px] leading-relaxed">
          Deterministic emission factor calculations via IPCC AR6 & CEA India Grid v19.
        </p>
      </div>
    </aside>
  );
};
