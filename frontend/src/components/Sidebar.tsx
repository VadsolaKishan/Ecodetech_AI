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
  Sparkles,
  ShieldCheck,
  Users,
  Database,
  BookOpen,
  Factory,
  Bot
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/roles";

export const Sidebar: React.FC = () => {
  const { role, isReadOnly } = useAuth();

  // Define role-specific navigation menus strictly matching Section 10
  const getNavItems = () => {
    switch (role) {
      case "SUSTAINABILITY_CONSULTANT":
        return [
          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/admin/industries", label: "Assigned Factories", icon: Factory },
          { to: "/assessment/new", label: "Carbon Assessments", icon: ClipboardCheck },
          { to: "/hotspots", label: "Carbon Analysis", icon: Flame },
          { to: "/recommendations", label: "AI Recommendations", icon: Lightbulb, badge: "Circular" },
          { to: "/simulator", label: "Simulator", icon: Sliders },
          { to: "/scenarios", label: "Scenarios", icon: GitCompare },
          { to: "/action-plan", label: "Action Plan", icon: CheckSquare },
          { to: "/reports", label: "Reports", icon: FileText },
          { to: "/history", label: "Assessment History", icon: History },
        ];

      case "REGULATOR_AUDITOR":
        return [
          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/admin/industries", label: "Factories", icon: Factory },
          { to: "/history", label: "Assessments", icon: ClipboardCheck },
          { to: "/hotspots", label: "Carbon Analysis", icon: Flame },
          { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
          { to: "/admin/emission-factors", label: "Emission Factors", icon: Database },
          { to: "/reports", label: "Reports", icon: FileText },
          { to: "/audit-logs", label: "Audit Trail", icon: ShieldCheck, badge: "Secure" },
        ];

      case "ADMIN":
        return [
          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/admin/industries", label: "Factories", icon: Factory },
          { to: "/history", label: "Assessments", icon: ClipboardCheck },
          { to: "/hotspots", label: "Carbon Analysis", icon: Flame },
          { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
          { to: "/simulator", label: "Simulator", icon: Sliders },
          { to: "/scenarios", label: "Scenarios", icon: GitCompare },
          { to: "/action-plan", label: "Action Plans", icon: CheckSquare },
          { to: "/reports", label: "Reports", icon: FileText },
          { to: "/admin/users", label: "Users", icon: Users, badge: "RBAC" },
          { to: "/admin/emission-factors", label: "Emission Factors", icon: Database },
          { to: "/admin/recommendation-knowledge", label: "Knowledge Base", icon: BookOpen },
          { to: "/audit-logs", label: "Audit Logs", icon: ShieldCheck },
        ];

      case "FACTORY_OWNER":
      default:
        return [
          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/profile", label: "Factory Profile", icon: Building },
          { to: "/assessment/new", label: "Carbon Assessment", icon: ClipboardCheck },
          { to: "/hotspots", label: "Carbon Analysis", icon: Flame, badge: "Leak Detector" },
          { to: "/recommendations", label: "AI Recommendations", icon: Lightbulb, badge: "Circular" },
          { to: "/simulator", label: "Simulator", icon: Sliders, badge: "What-If" },
          { to: "/scenarios", label: "Scenarios", icon: GitCompare },
          { to: "/action-plan", label: "Action Plan", icon: CheckSquare },
          { to: "/reports", label: "Reports", icon: FileText },
          { to: "/history", label: "Assessment History", icon: History },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-industrial-900/95 border-r border-industrial-700/60 min-h-[calc(100vh-6rem)] p-4 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-1">
        {/* Role Banner Indicator */}
        {isReadOnly && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold tracking-tight text-center">
            READ ONLY — REGULATOR / AUDITOR
          </div>
        )}

        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-industrial-400 font-semibold flex items-center justify-between">
          <span>{role.replace("_", " ")} NAVIGATION</span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
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
          Deterministic emission calculations via IPCC AR6 & CEA India Grid v19.
        </p>
      </div>
    </aside>
  );
};
