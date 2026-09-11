import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Leaf, 
  Bot, 
  User as UserIcon, 
  LogOut, 
  Layers, 
  ShieldCheck,
  Building2
} from "lucide-react";
import { authApi } from "../services/api";

interface NavbarProps {
  onOpenAssistant: () => void;
  factoryName?: string;
  industryType?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAssistant, factoryName, industryType }) => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("carbon_user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    authApi.logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-industrial-900/90 border-b border-industrial-700/60 px-6 flex items-center justify-between sticky top-[37px] z-30 backdrop-blur-md">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <Link to="/dashboard" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-carbon-emerald via-carbon-green to-carbon-lime p-0.5 shadow-glow-green group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-industrial-950 rounded-[10px] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-carbon-green animate-pulse-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-white font-mono text-base">CARBONCOPILOT</span>
              <span className="bg-carbon-green/20 text-carbon-green text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border border-carbon-green/40">AI</span>
            </div>
            <p className="text-[10px] text-industrial-400 font-mono tracking-wider uppercase">Industrial Emission Copilot</p>
          </div>
        </Link>
      </div>

      {/* Center Plant Badge */}
      {factoryName && (
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-industrial-800/80 border border-industrial-700/60 text-xs">
          <Building2 className="w-3.5 h-3.5 text-carbon-green" />
          <span className="font-semibold text-white">{factoryName}</span>
          {industryType && <span className="text-industrial-400">({industryType})</span>}
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Telemetry
          </span>
        </div>
      )}

      {/* Right Action Icons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenAssistant}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-carbon-cyber/15 border border-carbon-cyber/40 text-carbon-cyber hover:bg-carbon-cyber/25 transition-all text-xs font-medium shadow-glow-cyber"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Ask CarbonCopilot</span>
        </button>

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
