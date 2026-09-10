"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowRight,
  Zap,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const DEPARTMENTS = [
  "Economic Statistics Division",
  "Social Statistics Division",
  "National Statistical Office",
  "NSSTA — Training Faculty",
  "MoSPI — IT Division",
  "State Statistical Bureau",
  "Central Statistical Office",
  "Labour Bureau",
  "Registrar General of India",
  "Other / External",
];

const ROLES = [
  { value: "learner", label: "Learner / Officer", desc: "Access assessments & learning paths", color: "#39ff14" },
  { value: "trainer", label: "Trainer / Faculty", desc: "Manage courses & track learners", color: "#d05bff" },
  { value: "admin", label: "Admin / HoD", desc: "Workforce analytics & reporting", color: "#55f2ff" },
];

const PERKS = [
  "Personalised competency passport",
  "AI-generated learning paths",
  "iGOT & NSSTA course integration",
  "Real-time skill gap analysis",
  "Role readiness scoring",
];

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "learner",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          department: form.department,
          role: form.role,
          password: form.password,
        }),
      });

      const data = await response.json();
      setPending(false);

      if (!response.ok) {
        setError(data.error?.message || data.error || "Registration failed.");
        return;
      }

      setSuccess(true);
      
      // Redirect after showing the success screen for a brief moment
      setTimeout(() => {
        window.location.href = data.redirect || "/learner";
      }, 1500);

    } catch (err) {
      setPending(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  const selectedRole = ROLES.find((r) => r.value === form.role)!;
  const passwordStrength =
    form.password.length === 0
      ? 0
      : form.password.length < 6
      ? 1
      : form.password.length < 10
      ? 2
      : 3;

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="mesh-bg" />
        <div className="relative z-10 glass-panel rounded-3xl p-12 max-w-md w-full text-center space-y-6 border border-primary-container/20">
          <div className="w-20 h-20 rounded-full bg-primary-container/15 border-2 border-primary-container/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary-container" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-on-surface font-display">Account Created!</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Welcome to StatIQ AI, <strong className="text-on-surface">{form.name}</strong>. Your competency passport is being initialised.
            </p>
          </div>
          <Link
            href="/login"
            className="glow-button text-black font-bold py-3.5 px-8 rounded-xl font-label-caps text-label-caps tracking-widest inline-flex items-center gap-2"
          >
            SIGN IN NOW
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-14 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/8 via-background to-primary-container/8 z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-container/6 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-container/5 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 z-0" />
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-primary-container/60 flex items-center justify-center font-bold text-black text-lg">
              Σ
            </div>
            <span className="font-display text-xl font-bold text-on-surface tracking-tight">StatIQ AI</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-container/30 bg-secondary-container/10">
              <Zap className="w-3.5 h-3.5 text-secondary-fixed-dim" />
              <span className="font-label-caps text-label-caps text-secondary-fixed-dim text-xs">JOIN THE PLATFORM</span>
            </div>
            <h1 className="font-display text-5xl font-bold text-on-surface leading-tight tracking-tight">
              Start your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-container to-primary-container">
                Competency<br />Journey
              </span>
            </h1>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-sm">
              Create your account and get a personalised competency passport built from official MoSPI frameworks in under 5 minutes.
            </p>
          </div>

          {/* Perks list */}
          <div className="space-y-3">
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-3 text-sm text-on-surface-variant">
                <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-on-surface-variant/40 font-label-caps">
            MoSPI · DATA INFORMATICS & INNOVATION DIVISION · © 2026
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — FORM ── */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-10 lg:overflow-y-auto relative">
        <div className="absolute inset-0 bg-surface-container-low/30 lg:border-l border-white/5" />

        <div className="relative z-10 w-full max-w-md py-8 space-y-7">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-container to-primary-container/60 flex items-center justify-center font-bold text-black">
              Σ
            </div>
            <span className="font-display text-lg font-bold text-on-surface">StatIQ AI</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-on-surface font-display tracking-tight">Create account</h2>
            <p className="text-on-surface-variant text-sm">
              Already have one?{" "}
              <Link href="/login" className="text-primary-container hover:underline underline-offset-4 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-on-surface-variant font-label-caps text-label-caps">
              I am joining as
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => update("role", r.value)}
                  className="relative rounded-xl p-4 text-left border transition-all duration-200 flex flex-col gap-2"
                  style={{
                    borderColor: form.role === r.value ? `${r.color}50` : "rgba(255,255,255,0.1)",
                    background: form.role === r.value ? `${r.color}10` : "rgba(17,19,24,0.6)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {form.role === r.value && (
                    <span
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{ background: r.color }}
                    />
                  )}
                  <span
                    className="text-xs font-bold font-label-caps"
                    style={{ color: form.role === r.value ? r.color : undefined }}
                  >
                    {r.label}
                  </span>
                  <span className="text-[10px] text-on-surface-variant leading-tight">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant font-label-caps text-label-caps">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 w-4 h-4 text-on-surface-variant/50 z-10 pointer-events-none" />
                <input
                  className="auth-input w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder:text-on-surface-variant/40 text-sm outline-none transition-all duration-200 focus:border-primary-container/60 focus:ring-2 focus:ring-primary-container/15 focus:bg-surface-container-high"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  type="text"
                  placeholder="Ananya Sharma"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant font-label-caps text-label-caps">
                Official Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-on-surface-variant/50 z-10 pointer-events-none" />
                <input
                  className="auth-input w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder:text-on-surface-variant/40 text-sm outline-none transition-all duration-200 focus:border-primary-container/60 focus:ring-2 focus:ring-primary-container/15 focus:bg-surface-container-high"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  type="email"
                  placeholder="officer@nic.in"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant font-label-caps text-label-caps">
                Department / Division
              </label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-4 w-4 h-4 text-on-surface-variant/50 z-10 pointer-events-none" />
                <select
                  className="auth-input w-full pl-11 pr-10 py-3.5 rounded-xl bg-surface-container border border-white/10 text-on-surface text-sm outline-none transition-all duration-200 focus:border-primary-container/60 focus:ring-2 focus:ring-primary-container/15 focus:bg-surface-container-high appearance-none"
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                  required
                >
                  <option value="" disabled>Select your department…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 w-4 h-4 text-on-surface-variant/50 pointer-events-none z-10" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant font-label-caps text-label-caps">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-on-surface-variant/50 z-10 pointer-events-none" />
                <input
                  className="auth-input w-full pl-11 pr-12 py-3.5 rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder:text-on-surface-variant/40 text-sm outline-none transition-all duration-200 focus:border-primary-container/60 focus:ring-2 focus:ring-primary-container/15 focus:bg-surface-container-high"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 text-on-surface-variant/50 hover:text-on-surface transition-colors z-10"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {form.password.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background:
                          passwordStrength >= level
                            ? level === 1
                              ? "#ff4444"
                              : level === 2
                              ? "#f5a623"
                              : "#39ff14"
                            : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                  <span className="text-xs text-on-surface-variant ml-1">
                    {passwordStrength === 1 ? "Weak" : passwordStrength === 2 ? "Good" : "Strong"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant font-label-caps text-label-caps">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-on-surface-variant/50 z-10 pointer-events-none" />
                <input
                  className="auth-input w-full pl-11 pr-12 py-3.5 rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder:text-on-surface-variant/40 text-sm outline-none transition-all duration-200 focus:border-primary-container/60 focus:ring-2 focus:ring-primary-container/15 focus:bg-surface-container-high"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 text-on-surface-variant/50 hover:text-on-surface transition-colors z-10"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Match indicator */}
              {form.confirmPassword.length > 0 && (
                <p
                  className="text-xs mt-1 flex items-center gap-1"
                  style={{ color: form.password === form.confirmPassword ? "#39ff14" : "#ff4444" }}
                >
                  {form.password === form.confirmPassword ? (
                    <><CheckCircle2 className="w-3 h-3" /> Passwords match</>
                  ) : (
                    <><span className="w-3 h-3 inline-block">✕</span> Passwords do not match</>
                  )}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                {error}
              </div>
            )}

            {/* Terms */}
            <p className="text-xs text-on-surface-variant/50 leading-relaxed">
              By creating an account you agree to our{" "}
              <span className="text-primary-container/80 cursor-pointer hover:text-primary-container transition-colors">
                Terms of Use
              </span>{" "}
              and{" "}
              <span className="text-primary-container/80 cursor-pointer hover:text-primary-container transition-colors">
                Privacy Policy
              </span>
              .
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3.5 rounded-xl font-label-caps text-label-caps tracking-widest font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: pending
                  ? `${selectedRole.color}80`
                  : selectedRole.color,
                color: "#000",
                boxShadow: !pending ? `0 0 20px ${selectedRole.color}40` : "none",
              }}
            >
              {pending ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  CREATING ACCOUNT…
                </>
              ) : (
                <>
                  CREATE ACCOUNT
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-on-surface-variant/40 font-label-caps">
            SIH 2026 · MoSPI · SYNTHETIC DEMO DATA
          </p>
        </div>
      </div>
    </div>
  );
}
