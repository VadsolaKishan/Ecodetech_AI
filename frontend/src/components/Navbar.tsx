import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bot, 
  LogOut, 
  Building2,
  ChevronDown,
  CheckCircle2,
  Factory,
  MapPin,
  ExternalLink,
  Loader2
} from "lucide-react";
import { EcoDetectLogo } from "./EcoDetectLogo";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS, ROLE_BADGE_COLORS } from "../types/roles";
import { industryApi } from "../services/api";

interface NavbarProps {
  onOpenAssistant: () => void;
  factoryName?: string;
  industryType?: string;
  onSelectFactory?: (factoryId: number, factoryName: string, sector: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAssistant,
  factoryName,
  industryType,
  onSelectFactory,
}) => {
  const navigate = useNavigate();
  const { user, role, isReadOnly, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [factories, setFactories] = useState<any[]>([]);
  const [loadingFactories, setLoadingFactories] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleColors = ROLE_BADGE_COLORS[role] || ROLE_BADGE_COLORS.FACTORY_OWNER;

  // Load facilities list when opening dropdown
  const loadFactories = async () => {
    if (factories.length > 0) return;
    setLoadingFactories(true);
    try {
      const data = await industryApi.list();
      setFactories(data || []);
    } catch (err) {
      console.error("Failed to load facilities", err);
    } finally {
      setLoadingFactories(false);
    }
  };

  const handleToggleDropdown = () => {
    const nextState = !isDropdownOpen;
    setIsDropdownOpen(nextState);
    if (nextState) {
      loadFactories();
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChooseFactory = (f: any) => {
    setIsDropdownOpen(false);
    if (onSelectFactory) {
      onSelectFactory(f.id, f.company_name, f.industry_type);
    }
  };

  const displayFactoryName = factoryName || localStorage.getItem("carbon_active_factory_name") || "Select Facility";
  const displaySector = industryType || localStorage.getItem("carbon_active_factory_sector") || "";

  return (
    <header className="h-16 bg-industrial-900/90 border-b border-industrial-700/60 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <Link to="/dashboard" className="flex items-center space-x-2.5 group">
          <EcoDetectLogo size="md" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-white font-mono text-base">ECODETECT</span>
              <span className="bg-carbon-green/20 text-carbon-green text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border border-carbon-green/40">AI</span>
            </div>
            <p className="text-[10px] text-industrial-400 font-mono tracking-wider uppercase">Industrial Ecological Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Center Plant Badge with Interactive Switcher Dropdown */}
      <div className="hidden md:flex items-center space-x-3 relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggleDropdown}
          style={{ backgroundColor: "#0f172a" }}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-industrial-700/80 hover:border-carbon-green/50 text-xs text-left transition-all shadow-sm group"
        >
          <Building2 className="w-3.5 h-3.5 text-carbon-green group-hover:scale-110 transition-transform" />
          <div className="flex items-baseline gap-1.5 max-w-[280px] truncate">
            <span className="font-bold text-white group-hover:text-carbon-green transition-colors truncate">
              {displayFactoryName}
            </span>
            {displaySector && <span className="text-industrial-400 text-[11px] truncate">({displaySector})</span>}
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-500/30 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-industrial-400 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? "rotate-180 text-carbon-green" : ""}`} />
        </button>



        {/* Facilities Switcher Dropdown Menu - 100% Solid Opaque Background */}
        {isDropdownOpen && (
          <div
            style={{ backgroundColor: "#090e1a", zIndex: 100 }}
            className="absolute top-full left-0 mt-2.5 w-[460px] max-w-[95vw] border border-industrial-700/90 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.98),0_0_0_1px_rgba(255,255,255,0.06)] p-3.5 animate-fade-in"
          >
            {/* Header */}
            <div
              style={{ backgroundColor: "#0f172a" }}
              className="px-3 py-2.5 mb-2.5 rounded-xl border border-industrial-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-carbon-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Select Operating Facility
                </span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-carbon-green/20 text-carbon-green font-mono font-bold border border-carbon-green/40">
                {factories.length} Registered Plants
              </span>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {loadingFactories ? (
                <div className="py-8 flex items-center justify-center gap-2 text-xs text-industrial-400">
                  <Loader2 className="w-4 h-4 animate-spin text-carbon-green" /> Loading facilities...
                </div>
              ) : factories.length === 0 ? (
                <div className="py-6 text-center text-xs text-industrial-400 font-mono">
                  No other facilities registered yet.
                </div>
              ) : (
                factories.map((f) => {
                  const isSelected = f.company_name === displayFactoryName || f.id === factories.find((p: any) => p.company_name === displayFactoryName)?.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => handleChooseFactory(f)}
                      style={{ backgroundColor: isSelected ? "#112224" : "#0f172a" }}
                      className={`px-3.5 py-3 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                        isSelected
                          ? "border-carbon-green/60 shadow-sm shadow-carbon-green/20 text-white"
                          : "border-industrial-800/80 hover:border-carbon-green/40 hover:brightness-125 text-industrial-300"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-carbon-green/25 text-carbon-green border border-carbon-green/50"
                              : "bg-industrial-800/80 text-industrial-400 border border-industrial-700/60"
                          }`}
                        >
                          <Factory className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold leading-snug ${isSelected ? "text-white" : "text-industrial-100"}`}>
                              {f.company_name}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                isSelected
                                  ? "bg-carbon-green/20 text-carbon-green border-carbon-green/40"
                                  : "bg-industrial-800/90 text-industrial-400 border-industrial-700/60"
                              }`}
                            >
                              {f.industry_type || "Manufacturing"}
                            </span>
                          </div>
                          <div className="text-[11px] text-industrial-400 mt-1 flex items-center gap-1">
                            <MapPin className={`w-3 h-3 flex-shrink-0 ${isSelected ? "text-carbon-green" : "text-industrial-500"}`} />
                            <span className="truncate">{f.factory_location || "Industrial Park, Gujarat"}</span>
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3 text-industrial-950 bg-carbon-green font-mono text-[10px] font-bold px-2 py-1 rounded-md shadow-glow-green">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ACTIVE</span>
                        </div>
                      ) : (
                        <div className="text-industrial-500 hover:text-carbon-green text-[11px] font-mono flex-shrink-0 ml-2">
                          Switch &rarr;
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-2.5 mt-2.5 border-t border-industrial-800/80">
              <Link
                to="/admin/industries"
                onClick={() => setIsDropdownOpen(false)}
                style={{ backgroundColor: "#0f172a" }}
                className="w-full py-2.5 px-3.5 rounded-xl text-xs text-carbon-green hover:bg-carbon-green/15 flex items-center justify-between transition-all font-semibold border border-industrial-800 hover:border-carbon-green/40"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-carbon-green" />
                  Manage All Industrial Facilities
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-industrial-400" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center space-x-3">
        {/* AI Assistant button */}
        {!isReadOnly && (
          <button
            onClick={onOpenAssistant}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-carbon-cyber/15 border border-carbon-cyber/40 text-carbon-cyber hover:bg-carbon-cyber/25 transition-all text-xs font-medium shadow-glow-cyber"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Copilot</span>
          </button>
        )}

        {/* Current User Role Badge */}
        {user && (
          <span
            className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}
          >
            {ROLE_LABELS[role] || role}
          </span>
        )}

        <div className="h-6 w-px bg-industrial-700/60 mx-1"></div>

        {user ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-industrial-800/60 border border-industrial-700 text-xs">
              <div className="w-6 h-6 rounded-full bg-carbon-green/20 text-carbon-green flex items-center justify-center font-bold text-[11px]">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <span className="text-industrial-200 hidden lg:inline font-medium">{user.full_name}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-industrial-400 hover:text-carbon-critical hover:bg-industrial-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-xs px-3 py-1.5 rounded-lg bg-carbon-green text-industrial-950 font-semibold hover:bg-carbon-lime transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
