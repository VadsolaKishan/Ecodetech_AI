import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, KeyRound, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { EcoDetectLogo } from "../components/EcoDetectLogo";
import { authApi } from "../services/api";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [generatedCodeHint, setGeneratedCodeHint] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send reset code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered work email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim().toLowerCase());
      if (res?.data?.code) {
        setGeneratedCodeHint(res.data.code);
        setCode(res.data.code);
      }
      setStep("verify");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to find account or send reset code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and update password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        new_password: newPassword,
      });
      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reset password. Please verify the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 bg-industrial-grid flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-industrial-900/90 border border-industrial-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <EcoDetectLogo size="lg" className="mb-3" />
          <h2 className="text-xl font-bold tracking-tight text-white font-mono">ECODETECT AI</h2>
          <p className="text-xs text-industrial-400 mt-1">Industrial Ecological Security &amp; Access Recovery</p>
        </div>

        {/* Step Indicator */}
        {step !== "success" && (
          <div className="flex items-center justify-center space-x-2 text-[11px] font-mono">
            <span className={`px-2.5 py-1 rounded-lg border ${step === "request" ? "bg-carbon-green/20 border-carbon-green text-carbon-green font-bold" : "bg-industrial-800 border-industrial-700 text-industrial-400"}`}>
              1. Request Code
            </span>
            <span className="text-industrial-600">→</span>
            <span className={`px-2.5 py-1 rounded-lg border ${step === "verify" ? "bg-carbon-green/20 border-carbon-green text-carbon-green font-bold" : "bg-industrial-800 border-industrial-700 text-industrial-400"}`}>
              2. Reset Password
            </span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Step 1: Request Code Form */}
        {step === "request" && (
          <form onSubmit={handleRequestCode} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-medium text-industrial-300 mb-1">
                Registered Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="plant.manager@factory.com"
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
                />
              </div>
              <p className="text-[11px] text-industrial-400 mt-1.5 leading-relaxed">
                Enter your registered enterprise email address to generate a 6-digit recovery code.
              </p>
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="p-2.5 rounded-xl bg-industrial-950/60 border border-industrial-800 text-[11px] text-industrial-400 space-y-1.5">
              <span className="font-mono text-[10px] uppercase text-industrial-500 font-semibold block">
                Quick Demo Accounts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("rajesh.patel@carboncopilot.ai");
                    if (error) setError("");
                  }}
                  className="px-2 py-0.5 rounded bg-industrial-800 hover:bg-industrial-700 hover:text-white transition-colors text-[10px]"
                >
                  Rajesh Patel (Owner)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("priya.shah@carboncopilot.ai");
                    if (error) setError("");
                  }}
                  className="px-2 py-0.5 rounded bg-industrial-800 hover:bg-industrial-700 hover:text-white transition-colors text-[10px]"
                >
                  Priya Shah (Consultant)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-carbon-green text-industrial-950 font-bold hover:bg-carbon-lime transition-all flex items-center justify-center space-x-2 text-xs shadow-glow-green"
            >
              <span>{loading ? "Generating Code..." : "Send Verification Code"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Verification Code & New Password Form */}
        {step === "verify" && (
          <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-carbon-green shrink-0" />
                <span>Code dispatched for <b>{email}</b></span>
              </div>
              <button
                type="button"
                onClick={() => setStep("request")}
                className="text-[10px] text-industrial-400 hover:text-white underline font-mono ml-2"
              >
                Change Email
              </button>
            </div>

            {/* If demo code was returned, provide instant 1-click helper */}
            {generatedCodeHint && (
              <div className="p-2.5 rounded-xl bg-industrial-950 border border-carbon-green/40 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-1.5 text-industrial-300 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-carbon-green" />
                  <span>Demo Code: <b className="text-carbon-green tracking-widest">{generatedCodeHint}</b></span>
                </div>
                <button
                  type="button"
                  onClick={() => setCode(generatedCodeHint)}
                  className="text-[10px] px-2 py-0.5 rounded bg-carbon-green/20 text-carbon-green hover:bg-carbon-green hover:text-industrial-950 transition-colors font-bold"
                >
                  Auto-fill Code
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-industrial-300 mb-1">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. 123456"
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 font-mono tracking-widest focus:outline-none focus:border-carbon-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-industrial-300 mb-1">
                New Password (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-carbon-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-industrial-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-industrial-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError("");
                  }}
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
              <span>{loading ? "Updating Password..." : "Confirm & Reset Password"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 3: Success State */}
        {step === "success" && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-carbon-green/20 border border-carbon-green/40 rounded-full flex items-center justify-center mx-auto text-carbon-green shadow-glow-green">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Password Reset Successfully!</h3>
              <p className="text-xs text-industrial-300 mt-1 leading-relaxed">
                Your account password has been updated. You can now sign in with your new credentials.
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2.5 rounded-xl bg-carbon-green text-industrial-950 font-bold hover:bg-carbon-lime transition-all flex items-center justify-center space-x-2 text-xs shadow-glow-green"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Back to Sign In Link */}
        <div className="pt-4 border-t border-industrial-800 text-center text-xs text-industrial-400">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-carbon-green hover:underline font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
