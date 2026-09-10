"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Activity,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

const demos = [
  {
    email: "learner@statiq.demo",
    role: "Learner",
    name: "Ananya Sharma",
    dept: "Economic Statistics Division",
    color: "#39ff14",
  },
  {
    email: "trainer@statiq.demo",
    role: "Trainer",
    name: "Ravi Menon",
    dept: "NSSTA Training Faculty",
    color: "#d05bff",
  },
  {
    email: "admin@statiq.demo",
    role: "Admin",
    name: "Kavita Iyer",
    dept: "MoSPI IT Division",
    color: "#55f2ff",
  },
];

const STATS = [
  { icon: Activity, value: "200+", label: "Competency Domains" },
  { icon: BookOpen, value: "1,200+", label: "iGOT Courses" },
  { icon: ShieldCheck, value: "80+", label: "Role Profiles" },
];

import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const [email, setEmail] = useState("learner@statiq.demo");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      setPending(false);
      if (!response.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : data.error?.message ?? "Sign-in failed.";
        setError(message);
        return;
      }
      window.location.href = redirectUrl || ((data.redirect ?? data.data?.redirect ?? "/learner") as string);
    } catch {
      setPending(false);
      setError("Could not reach the sign-in service. Is the app running?");
    }
  }

  async function loginAsDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo123");
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: "demo123" }),
      });
      const data = await response.json().catch(() => ({}));
      setPending(false);
      if (!response.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : data.error?.message ?? "Sign-in failed.";
        setError(message);
        return;
      }
      window.location.href = redirectUrl || ((data.redirect ?? data.data?.redirect ?? "/learner") as string);
    } catch {
      setPending(false);
      setError("Could not reach the sign-in service. Is the app running?");
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/8 via-background to-secondary-container/8 z-0" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-container/6 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 z-0" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-container/6 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 z-0" />

        {/* Grid dot pattern */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-primary-container/60 flex items-center justify-center font-bold text-black text-lg">
              Σ
            </div>
            <span className="font-display text-xl font-bold text-on-surface tracking-tight">StatIQ AI</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10">
            <Zap className="w-3.5 h-3.5 text-primary-container" />
            <span className="font-label-caps text-label-caps text-primary-container text-xs">SIH 2026 · PROBLEM STATEMENT 26101</span>
          </div>

          {/* Headline */}
          <div className="space-y-5">
            <h1 className="font-display text-5xl font-bold text-on-surface leading-tight tracking-tight">
              Competency Intelligence<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-secondary-container">
                for India's Statistical<br />Workforce
              </span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
              Close the loop: Profile → Assessment → Skill Gap → iGOT/NSSTA Recommendation → Updated Competency.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-panel rounded-xl p-4 border border-white/5 space-y-2">
                  <Icon className="w-5 h-5 text-primary-container" />
                  <div className="font-bold text-2xl text-on-surface font-display">{s.value}</div>
                  <div className="text-xs text-on-surface-variant leading-tight font-label-caps">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-on-surface-variant/40 font-label-caps">
            MoSPI · DATA INFORMATICS & INNOVATION DIVISION · © 2026
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle right-panel bg */}
        <div className="absolute inset-0 bg-surface-container-low/30 lg:border-l border-white/5" />

        <div className="relative z-10 w-full max-w-md space-y-8">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-container to-primary-container/60 flex items-center justify-center font-bold text-black">
              Σ
            </div>
            <span className="font-display text-lg font-bold text-on-surface">StatIQ AI</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-on-surface font-display tracking-tight">
              Welcome back
            </h2>
            <p className="text-on-surface-variant text-sm">
              Sign in to your competency dashboard.{" "}
              <Link href="/signup" className="text-primary-container hover:underline underline-offset-4 transition-colors">
                No account? Sign up
              </Link>
            </p>
          </div>

          {/* Demo hint */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-primary-container/8 border border-primary-container/20">
            <Zap className="w-4 h-4 text-primary-container mt-0.5 shrink-0" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <span className="text-primary-container font-medium">Demo mode:</span> Click a role below to instantly log in with a pre-configured synthetic profile.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-on-surface-variant font-label-caps text-label-caps">
                Email Address
              </label>
              <div
                className="relative flex items-center"
                data-focused={focusedField === "email"}
              >
                <Mail className="absolute left-4 w-4 h-4 text-on-surface-variant/50 z-10 pointer-events-none" />
                <input
                  className="auth-input w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder:text-on-surface-variant/40 text-sm outline-none transition-all duration-200 focus:border-primary-container/60 focus:ring-2 focus:ring-primary-container/15 focus:bg-surface-container-high"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  type="email"
                  name="email"
                  placeholder="officer@statiq.demo"
                  autoComplete="username"
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-on-surface-variant font-label-caps text-label-caps">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-primary-container hover:underline underline-offset-4 font-label-caps"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-on-surface-variant/50 z-10 pointer-events-none" />
                <input
                  className="auth-input w-full pl-11 pr-12 py-3.5 rounded-xl bg-surface-container border border-white/10 text-on-surface placeholder:text-on-surface-variant/40 text-sm outline-none transition-all duration-200 focus:border-primary-container/60 focus:ring-2 focus:ring-primary-container/15 focus:bg-surface-container-high"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  suppressHydrationWarning
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
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="w-full glow-button text-black font-bold py-3.5 rounded-xl font-label-caps text-label-caps tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
            >
              {pending ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  SIGNING IN…
                </>
              ) : (
                <>
                  SIGN IN
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-on-surface-variant/40 font-label-caps">OR SELECT DEMO ACCOUNT</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Demo account cards */}
          <div className="space-y-2.5">
            {demos.map((demo) => (
              <button
                type="button"
                key={demo.email}
                onClick={() => loginAsDemo(demo.email)}
                className="w-full glass-panel glass-panel-interactive rounded-xl px-5 py-4 text-left flex items-center gap-4 group"
                style={{
                  borderColor: email === demo.email ? `${demo.color}40` : undefined,
                  background: email === demo.email ? `${demo.color}08` : undefined,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-label-caps shrink-0 transition-all"
                  style={{
                    background: `${demo.color}18`,
                    border: `1px solid ${demo.color}30`,
                    color: demo.color,
                  }}
                >
                  {demo.role.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-on-surface">{demo.name}</span>
                    <span
                      className="text-xs font-label-caps px-2 py-0.5 rounded-full"
                      style={{ color: demo.color, background: `${demo.color}15`, border: `1px solid ${demo.color}25` }}
                    >
                      {demo.role}
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">{demo.dept}</div>
                  <div className="text-xs text-on-surface-variant/50 mt-0.5 font-label-caps">{demo.email}</div>
                </div>
                {email === demo.email && (
                  <span style={{ color: demo.color }} className="text-xs font-label-caps shrink-0">SELECTED</span>
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-on-surface-variant/40 font-label-caps pt-2">
            SIH 2026 · MoSPI · SYNTHETIC DEMO DATA
          </p>
        </div>
      </div>
    </div>
  );
}
