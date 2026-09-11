import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Building2, UserCheck, Shield, CheckCircle2 } from "lucide-react";
import { EcoDetectLogo } from "../components/EcoDetectLogo";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/roles";

interface RoleOption {
  id: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  borderActive: string;
  bgActive: string;
  badgeColor: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "FACTORY_OWNER",
    title: "Factory Owner",
    subtitle: "Plant Operations & SME",
    description: "Manage own plant, input energy/materials, detect emission leak points, simulate circular ROI, and track action roadmaps.",
    icon: Building2,
    borderActive: "border-emerald-500",
    bgActive: "bg-emerald-950/40",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  {
    id: "SUSTAINABILITY_CONSULTANT",
    title: "Sustainability Consultant",
    subtitle: "Advisory & ESG Services",
    description: "Audit assigned industrial clients, verify Scope 1/2/3 calculations, configure decarbonization scenarios, and prepare reports.",
    icon: UserCheck,
    borderActive: "border-sky-500",
    bgActive: "bg-sky-950/40",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  },
  {
    id: "REGULATOR_AUDITOR",
    title: "Regulator / Auditor",
    subtitle: "Compliance & Government",
    description: "Read-only regulatory inspection mode to examine emissions methodologies, IPCC/CEA factors, and security audit logs.",
    icon: Shield,
    borderActive: "border-amber-500",
    bgActive: "bg-amber-950/40",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("FACTORY_OWNER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.register({
        email,
        password,
        full_name: fullName,
        role: selectedRole,
      });
      await refreshUser();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex items-center justify-center p-4 text-white py-12">
      <div className="w-full max-w-2xl bg-industrial-900/90 border border-industrial-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <EcoDetectLogo size="lg" className="mb-3" />
          <h2 className="text-2xl font-bold tracking-tight text-white font-mono">Create EcoDetect AI Account</h2>
          <p className="text-xs text-industrial-400 mt-1">
            Register for EcoDetect AI platform with your designated governance role
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-carbon-critical/15 border border-carbon-critical/40 text-carbon-critical text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6" autoComplete="off">
          {/* Step 1: User Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-industrial-800 pb-2">
              1. Personal & Organization Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-industrial-300 mb-1">Full Name & Title</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Rajesh Patel"
                    autoComplete="off"
                    className="w-full bg-industrial-950 border border-industrial-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-industrial-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@enterprise.com"
                    autoComplete="off"
                    className="w-full bg-industrial-950 border border-industrial-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-industrial-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Role Selection Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-industrial-800 pb-2">
              2. Select Your Platform Role
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedRole === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedRole(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? `${opt.borderActive} ${opt.bgActive} shadow-lg ring-1 ring-carbon-green/30`
                        : "border-industrial-800 bg-industrial-950/60 hover:border-industrial-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-industrial-900 border border-industrial-800 text-white">
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-carbon-green shrink-0" />
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">{opt.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{opt.subtitle}</p>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-industrial-800/60">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${opt.badgeColor}`}>
                        {opt.id.replace("_", " ")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-carbon-green text-industrial-950 font-bold hover:bg-carbon-lime transition-all flex items-center justify-center space-x-2 text-sm shadow-glow-green"
          >
            <span>{loading ? "Registering & Provisioning..." : `Register as ${selectedRole.replace("_", " ")}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-industrial-800 text-center text-xs text-industrial-400">
          Already have an account?{" "}
          <Link to="/login" className="text-carbon-green hover:underline font-semibold">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
