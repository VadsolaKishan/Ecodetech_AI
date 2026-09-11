import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle } from "lucide-react";
import { authApi } from "../services/api";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("factory_operator");
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
        role,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-industrial-900/90 border border-industrial-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-carbon-emerald via-carbon-green to-carbon-lime p-0.5 shadow-glow-green mb-3">
            <div className="w-full h-full bg-industrial-950 rounded-[10px] flex items-center justify-center">
              <Leaf className="w-6 h-6 text-carbon-green" />
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono">Create Plant Account</h2>
          <p className="text-xs text-industrial-400 mt-1">Register for CarbonCopilot AI industrial telemetry</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-carbon-critical/15 border border-carbon-critical/40 text-carbon-critical text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1">Full Name & Title</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Kumar (Operations VP)"
                className="w-full bg-industrial-950 border border-industrial-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
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
                placeholder="ramesh@steelmill.com"
                className="w-full bg-industrial-950 border border-industrial-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
              />
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
                className="w-full bg-industrial-950 border border-industrial-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1">Role in Organization</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-carbon-green"
            >
              <option value="factory_operator">Factory Operator / Plant Manager</option>
              <option value="sme_owner">SME Executive / Director</option>
              <option value="consultant">Sustainability Consultant</option>
              <option value="regulator">Industry Auditor / Regulator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-carbon-green text-industrial-950 font-bold hover:bg-carbon-lime transition-all flex items-center justify-center space-x-2 text-xs shadow-glow-green"
          >
            <span>{loading ? "Registering..." : "Complete Registration"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-industrial-800 text-center text-xs text-industrial-400">
          Already registered?{" "}
          <Link to="/login" className="text-carbon-green hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
