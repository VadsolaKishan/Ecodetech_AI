import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { authApi, demoApi } from "../services/api";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("demo@carboncopilot.ai");
    setPassword("demo1234");
  };

  const handleDirectDemoLaunch = async () => {
    try {
      setLoading(true);
      await demoApi.loadFactory(1);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-industrial-900/90 border border-industrial-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-carbon-emerald via-carbon-green to-carbon-lime p-0.5 shadow-glow-green mb-3">
            <div className="w-full h-full bg-industrial-950 rounded-[10px] flex items-center justify-center">
              <Leaf className="w-6 h-6 text-carbon-green" />
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono">CARBONCOPILOT AI</h2>
          <p className="text-xs text-industrial-400 mt-1">Industrial Decarbonization Intelligence Platform</p>
        </div>

        {/* Demo Shortcut Card */}
        <div className="mb-6 p-3 rounded-xl bg-carbon-green/10 border border-carbon-green/30 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1 text-xs font-semibold text-carbon-green">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hackathon Judge Quick-Access</span>
            </div>
            <p className="text-[11px] text-industrial-400">Instant access with preloaded demo factory</p>
          </div>
          <button
            onClick={handleDirectDemoLaunch}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-carbon-green text-industrial-950 font-bold hover:bg-carbon-lime transition-all shrink-0 shadow-glow-green"
          >
            Launch Demo
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-carbon-critical/15 border border-carbon-critical/40 text-carbon-critical text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
                className="w-full bg-industrial-950 border border-industrial-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-industrial-300">Password</label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] text-carbon-green hover:underline font-mono"
              >
                Autofill Demo Password
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-industrial-950 border border-industrial-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-carbon-green text-industrial-950 font-bold hover:bg-carbon-lime transition-all flex items-center justify-center space-x-2 text-xs shadow-glow-green"
          >
            <span>{loading ? "Signing in..." : "Sign In to Plant Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-industrial-800 text-center text-xs text-industrial-400">
          New enterprise?{" "}
          <Link to="/register" className="text-carbon-green hover:underline font-semibold">
            Register factory profile
          </Link>
        </div>
      </div>
    </div>
  );
};
