"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useTranslation } from "@/components/language/language-provider";
import {
  ArrowRight,
  Database,
  Activity,
  Route,
  Radar,
  Brain,
  BarChart3,
  BookOpen,
  ShieldCheck,
  FlaskConical,
  Users,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import type { BackendHealth } from "@/lib/backend";

interface HomeViewProps {
  stats: {
    competencies: number;
    roles: number;
    courses: number;
    programmes: number;
    sources: number;
  };
  backend?: BackendHealth;
}

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Users,
    title: "Build Your Profile",
    desc: "Upload your role, department, and existing qualifications. The system builds a baseline competency passport.",
    color: "from-primary-container to-primary-container/60",
    accent: "#39ff14",
  },
  {
    step: "02",
    icon: Activity,
    title: "AI Assessment",
    desc: "Adaptive quizzes and scenario tests dynamically evaluate your knowledge across all mapped competency domains.",
    color: "from-secondary-container to-secondary-container/60",
    accent: "#d05bff",
  },
  {
    step: "03",
    icon: Target,
    title: "Skill Gap Analysis",
    desc: "A multi-dimensional gap matrix pinpoints exactly where you stand versus the target role readiness benchmark.",
    color: "from-tertiary-container to-tertiary-container/60",
    accent: "#55f2ff",
  },
  {
    step: "04",
    icon: Route,
    title: "Personalised Recommendations",
    desc: "Curated iGOT / NSSTA courses are ranked and served in priority order to close your specific gaps fastest.",
    color: "from-primary-container to-secondary-container",
    accent: "#39ff14",
  },
];

const FEATURES = [
  {
    icon: Activity,
    title: "Real-time Assessment",
    desc: "Continuous cognitive evaluation with AI-generated quizzes that adapt to your response patterns in real time.",
    tag: "ASSESSMENT",
    accent: "border-t-primary-container",
  },
  {
    icon: Route,
    title: "Personalised Learning Paths",
    desc: "Algorithmic generation of custom curricula optimised for rapid comprehension, recommending iGOT / NSSTA courses.",
    tag: "LEARNING",
    accent: "border-t-secondary-container",
  },
  {
    icon: Radar,
    title: "Competency Mapping",
    desc: "Multi-dimensional skill matrix generation for precise talent alignment and role readiness scoring.",
    tag: "MAPPING",
    accent: "border-t-tertiary-container",
  },
  {
    icon: Brain,
    title: "AI Tutor Chat",
    desc: "Conversational AI tutor guides you through complex statistical concepts with examples drawn from official Indian datasets.",
    tag: "AI TUTOR",
    accent: "border-t-primary-container",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Org-wide competency heatmaps and trend analytics for training officers to visualise workforce readiness at a glance.",
    tag: "ANALYTICS",
    accent: "border-t-secondary-container",
  },
  {
    icon: ShieldCheck,
    title: "Role Readiness Score",
    desc: "Instant readiness score for any target job role, benchmarked against the official NCS / DoPT competency framework.",
    tag: "SCORING",
    accent: "border-t-tertiary-container",
  },
];

const USE_CASES = [
  {
    role: "Statistician / Officer",
    icon: TrendingUp,
    points: [
      "Know exactly which competencies you lack for the next role",
      "Get a prioritised reading list from official iGOT courses",
      "Track learning progress on your personal dashboard",
    ],
    accent: "#39ff14",
  },
  {
    role: "Training Officer / HoD",
    icon: Users,
    points: [
      "View department-wide competency heatmaps",
      "Schedule and assign targeted training batches",
      "Generate compliance and readiness reports in one click",
    ],
    accent: "#d05bff",
  },
  {
    role: "Ministry Administrator",
    icon: ShieldCheck,
    points: [
      "Monitor all-India statistical workforce intelligence",
      "Align NSSTA programmes to actual skill gaps",
      "Export competency data for APCTT / World Bank reporting",
    ],
    accent: "#55f2ff",
  },
];

const MINISTRY_LOGOS = [
  { short: "MoSPI", full: "Ministry of Statistics & PI" },
  { short: "iGOT", full: "Integrated Govt Online Training" },
  { short: "NSSTA", full: "Nat'l Statistical Systems Training Academy" },
  { short: "NIC", full: "National Informatics Centre" },
  { short: "DGS&D", full: "Directorate General of Supplies" },
  { short: "DoPT", full: "Dept of Personnel & Training" },
];

export function HomeView({ stats, backend }: HomeViewProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="mesh-bg"></div>
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-40">

        {/* ── HERO ── */}
        <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <div className="space-y-8 z-10 relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary-container bg-secondary-container/10 text-secondary-fixed-dim font-label-caps text-label-caps">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
              {t("home.badge", "AI-POWERED COMPETENCY INTELLIGENCE")}
            </div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg font-bold tracking-tighter text-on-surface">
              {t("home.title", "Competency Intelligence for India's Official Statistical System")}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              {t("home.subtitle", "AI-driven competency mapping, automated skill-gap analysis, personalized MoSPI-aligned learning paths, and real-time statistical intelligence for Indian Official Statistics.")}
            </p>

            {/* Live backend status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-white/10 text-xs font-label-caps text-on-surface-variant">
              <span
                className={`w-1.5 h-1.5 rounded-full ${backend?.status === "ok" ? "bg-primary-container animate-pulse" : "bg-error"}`}
              />
              {backend?.status === "ok"
                ? `BACKEND LIVE · POSTGRES ${backend.services?.database?.status ?? "CONNECTED"}`
                : `BACKEND OFFLINE — ${backend?.error ?? "start npm run dev:backend"}`}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/login"
                className="glow-button text-black px-8 py-4 rounded-lg font-label-caps text-label-caps font-bold tracking-widest flex items-center justify-center gap-2"
              >
                {t("home.ctaSignIn", "ACCESS WORKSPACE")}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/sources"
                className="glass-panel px-8 py-4 rounded-lg font-label-caps text-label-caps font-bold text-on-surface hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <Database className="w-5 h-5" />
                {t("nav.dataSources", "OFFICIAL DATA SOURCES")}
              </Link>
            </div>
          </div>

          {/* Hero visual — image */}
          <div className="relative z-0 h-[500px] lg:h-[700px] w-full glass-panel rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 z-0">
              <img
                alt="AI Tutor Illustration"
                className="w-full h-full object-cover opacity-80 mix-blend-screen"
                src="/hero.jpg"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10" />
            {/* Floating badge */}
            <div className="absolute bottom-6 left-6 z-20 glass-panel rounded-xl px-5 py-3 flex items-center gap-3 border border-primary-container/20">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-caps text-label-caps text-xs text-primary-container">AI ENGINE ACTIVE</span>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="space-y-8">
          <div className="text-center">
            <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
              {t("home.featuresTitle", "PLATFORM AT A GLANCE")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { value: stats.competencies || "200+", label: t("home.statsCompetencies", "Competency Domains"), color: "text-primary-container", border: "border-primary-container/30" },
              { value: stats.roles || "80+", label: t("home.statsRoles", "Job Roles Mapped"), color: "text-secondary-fixed-dim", border: "border-secondary-container/30" },
              { value: stats.courses || "1,200+", label: t("home.statsCourses", "iGOT Courses"), color: "text-tertiary-fixed-dim", border: "border-tertiary-container/30" },
              { value: "14", label: "Ministries / Bodies", color: "text-primary-fixed-dim", border: "border-primary-fixed/30" },
              { value: stats.sources || "12+", label: t("home.statsSources", "Official Data Sources"), color: "text-secondary-fixed-dim", border: "border-secondary-fixed/30" },
            ].map((s) => (
              <div
                key={s.label}
                className={`glass-panel rounded-xl p-6 text-center border ${s.border} hover:shadow-lg hover:scale-105 transition-all duration-300`}
              >
                <div className={`text-3xl font-bold font-display ${s.color} mb-2`}>{s.value}</div>
                <div className="text-xs uppercase font-label-caps text-on-surface-variant leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">THE INTELLIGENCE LOOP</p>
            <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg font-bold text-on-surface tracking-tight">
              {t("home.featuresSubtitle", "How It Works")}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              A closed-loop system that continuously improves your competency passport from first login to promotion.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary-container/20 via-secondary-container/40 to-primary-container/20 z-0" />

            {HOW_IT_WORKS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="glass-panel glass-panel-interactive rounded-xl p-8 flex flex-col gap-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${item.accent}20, ${item.accent}10)`, border: `1px solid ${item.accent}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.accent }} />
                    </div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant/40 text-2xl font-bold">{item.step}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold text-base">{item.title}</h3>
                    <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1.5 text-xs font-label-caps" style={{ color: item.accent }}>
                    <CheckCircle2 className="w-4 h-4" />
                    AUTOMATED
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FEATURE HIGHLIGHTS ── */}
        <section className="space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">CORE CAPABILITIES</p>
            <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg font-bold text-on-surface tracking-tight">
              {t("home.featuresTitle", "Everything You Need")}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Purpose-built for India&apos;s statistical workforce. Not a generic LMS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              const accentColors: Record<string, string> = {
                "border-t-primary-container": "#39ff14",
                "border-t-secondary-container": "#d05bff",
                "border-t-tertiary-container": "#55f2ff",
              };
              const color = accentColors[feat.accent] ?? "#39ff14";
              return (
                <div
                  key={feat.title}
                  className="glass-panel glass-panel-interactive rounded-xl p-8 flex flex-col gap-6 relative overflow-hidden border-t-2"
                  style={{ borderTopColor: color }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <span className="font-label-caps text-label-caps text-xs px-2 py-1 rounded-full border" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
                      {feat.tag}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-headline-md text-base text-on-surface font-bold">{feat.title}</h3>
                    <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{feat.desc}</p>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl" style={{ background: `${color}08` }} />
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/features" className="glow-button-secondary px-8 py-3 rounded-full font-label-caps text-label-caps inline-flex items-center gap-2">
              {t("common.viewAll", "SEE ALL FEATURES")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── DASHBOARD PREVIEW ── */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">INTELLIGENCE DASHBOARD</p>
            <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg font-bold text-on-surface tracking-tight">
              Visualise Workforce Readiness
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Military-grade precision dashboards for competency gaps, training coverage, and role readiness across every department.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-2 md:p-4 shadow-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-container to-secondary-container opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-xl z-0" />
            <div className="relative z-10 rounded-lg overflow-hidden border border-white/5">
              <img alt="StatIQ AI Dashboard Preview" className="w-full h-auto object-cover" src="/dashboard.jpg" />
            </div>
          </div>
        </section>

        {/* ── USE CASES ── */}
        <section className="space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">BUILT FOR EVERY ROLE</p>
            <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg font-bold text-on-surface tracking-tight">
              Who Uses StatIQ AI?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {USE_CASES.map((uc) => {
              const Icon = uc.icon;
              return (
                <div
                  key={uc.role}
                  className="glass-panel rounded-xl p-8 space-y-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                  style={{ borderBottom: `2px solid ${uc.accent}40` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${uc.accent}15`, border: `1px solid ${uc.accent}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: uc.accent }} />
                    </div>
                    <h3 className="font-headline-md text-base text-on-surface font-bold leading-snug">{uc.role}</h3>
                  </div>
                  <ul className="space-y-3">
                    {uc.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-3 text-sm text-on-surface-variant">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: uc.accent }} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ background: uc.accent }} />
                </div>
              );
            })}
          </div>
        </section>

        {/* ── MINISTRY STRIP ── */}
        <section className="space-y-10">
          <div className="text-center">
            <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
              {t("home.architectureSubtitle", "ALIGNED WITH OFFICIAL BODIES")}
            </p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {MINISTRY_LOGOS.map((m) => (
              <div
                key={m.short}
                className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center border border-white/5 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-container/20 to-secondary-container/20 flex items-center justify-center font-bold font-label-caps text-primary-container text-xs">
                  {m.short.slice(0, 2)}
                </div>
                <div className="font-label-caps text-label-caps text-on-surface font-bold text-xs">{m.short}</div>
                <div className="text-[10px] text-on-surface-variant leading-tight hidden group-hover:block">{m.full}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DATA SOURCES CALLOUT ── */}
        <section className="glass-panel rounded-2xl p-10 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-center border border-primary-container/20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/30">
              <Zap className="w-4 h-4 text-primary-container" />
              <span className="font-label-caps text-label-caps text-primary-container text-xs">
                {t("nav.dataSources", "OFFICIAL DATA SOURCES")}
              </span>
            </div>
            <h2 className="font-display-lg-mobile text-display-lg-mobile font-bold text-on-surface tracking-tight">
              Backed by Real Government Data
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Every competency domain, every role, and every learning recommendation is derived from official MoSPI, NCS, and DoPT sources — not scraped or synthesised.
            </p>
            <Link href="/sources" className="glow-button text-black px-6 py-3 rounded-lg font-label-caps text-label-caps font-bold inline-flex items-center gap-2">
              {t("home.ctaExplore", "EXPLORE SOURCES")}
              <Database className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "NSQF Occupational Standards", tag: "ROLES" },
              { label: "NCS Job Role Taxonomy", tag: "TAXONOMY" },
              { label: "iGOT Karmayogi Course DB", tag: "COURSES" },
              { label: "NSSTA Training Programmes", tag: "TRAINING" },
              { label: "DoPT Competency Framework", tag: "FRAMEWORK" },
              { label: "MoSPI Statistical Reports", tag: "STATS" },
            ].map((s) => (
              <div key={s.label} className="bg-surface-container-low rounded-lg p-4 border border-white/5 space-y-1">
                <div className="font-label-caps text-label-caps text-primary-container text-xs">{s.tag}</div>
                <div className="text-sm text-on-surface font-medium leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 via-surface-container to-secondary-container/20 z-0" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl z-0" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl z-0" />
          <div className="relative z-10 flex flex-col items-center justify-center text-center gap-8 py-24 px-8 border border-white/10 rounded-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-container/40 bg-primary-container/10 font-label-caps text-label-caps text-primary-container text-xs">
              <FlaskConical className="w-4 h-4" />
              SIH 2026 · PROBLEM STATEMENT 26101
            </div>
            <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg font-bold text-on-surface tracking-tight max-w-3xl">
              {t("home.startJourney", "Ready to Accelerate India's Statistical Workforce?")}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              {t("home.subtitle", "Join the demo and see how StatIQ AI transforms competency data into actionable learning in under 60 seconds.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="glow-button text-black px-10 py-4 rounded-xl font-label-caps text-label-caps font-bold tracking-widest inline-flex items-center gap-2">
                {t("actions.signIn", "GET STARTED FREE")}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/catalogue" className="glow-button-secondary px-10 py-4 rounded-xl font-label-caps text-label-caps font-bold tracking-widest inline-flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t("nav.catalogue", "BROWSE CATALOGUE")}
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
