import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectByRole = () => {
    navigate("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      redirectByRole();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-industrial-900/90 border border-industrial-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-carbon-emerald via-carbon-green to-carbon-lime p-0.5 shadow-glow-green mb-3">
            <div className="w-full h-full bg-industrial-950 rounded-[10px] flex items-center justify-center">
              <Leaf className="w-6 h-6 text-carbon-green" />
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono">CARBONCOPILOT AI</h2>
          <p className="text-xs text-industrial-400 mt-1">Industrial Emission Copilot & Decarbonization Platform</p>
        </div>

        {/* Quick Demo Role Select */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono text-industrial-400 uppercase tracking-wider">
            ⚡ Quick Demo Sign-In (Select Role):
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail("rajesh.patel@carboncopilot.ai");
                setPassword("RajeshPatel@Carbon2026!");
              }}
              className="p-2 rounded-xl bg-industrial-950 border border-industrial-800 hover:border-carbon-green text-left transition-all group"
            >
              <span className="block text-[10px] font-mono text-carbon-green font-semibold">Factory Owner</span>
              <span className="block text-xs text-white font-medium group-hover:text-carbon-green">Rajesh Patel</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("priya.shah@carboncopilot.ai");
                setPassword("PriyaShah@Carbon2026!");
              }}
              className="p-2 rounded-xl bg-industrial-950 border border-industrial-800 hover:border-carbon-cyber text-left transition-all group"
            >
              <span className="block text-[10px] font-mono text-carbon-cyber font-semibold">Consultant</span>
              <span className="block text-xs text-white font-medium group-hover:text-carbon-cyber">Priya Shah</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("amit.desai@carboncopilot.ai");
                setPassword("AmitDesai@Carbon2026!");
              }}
              className="p-2 rounded-xl bg-industrial-950 border border-industrial-800 hover:border-amber-400 text-left transition-all group"
            >
              <span className="block text-[10px] font-mono text-amber-400 font-semibold">Regulator (Read-Only)</span>
              <span className="block text-xs text-white font-medium group-hover:text-amber-400">Amit Desai</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("arjun.mehta@carboncopilot.ai");
                setPassword("ArjunMehta@Carbon2026!");
              }}
              className="p-2 rounded-xl bg-industrial-950 border border-industrial-800 hover:border-purple-400 text-left transition-all group"
            >
              <span className="block text-[10px] font-mono text-purple-400 font-semibold">System Admin</span>
              <span className="block text-xs text-white font-medium group-hover:text-purple-400">Arjun Mehta</span>
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-medium text-industrial-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="plant.manager@factory.com"
                autoComplete="off"
                className="w-full bg-industrial-950 border border-industrial-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-industrial-950 border border-industrial-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-carbon-green text-industrial-950 font-bold hover:bg-carbon-lime transition-all flex items-center justify-center space-x-2 text-xs shadow-glow-green"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Industrial Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-industrial-800 text-center text-xs text-industrial-400">
          New enterprise or auditor?{" "}
          <Link to="/register" className="text-carbon-green hover:underline font-semibold">
            Register new account
          </Link>
        </div>
      </div>
    </div>
  );
};
