import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Activity,
  Route,
  Radar,
  Brain,
  BarChart3,
  ShieldCheck,
  BookOpen,
  FlaskConical,
  Users,
  Zap,
  Lock,
  Globe,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Features — StatIQ AI",
  description:
    "Explore all capabilities of StatIQ AI: AI assessment, competency mapping, personalised learning paths, analytics dashboards, and more for India's official statistical workforce.",
};

const FEATURES = [
  {
    icon: Activity,
    tag: "ASSESSMENT",
    title: "Real-time Assessment",
    desc: "Continuous cognitive evaluation adapting dynamically to user input patterns. AI-generated quizzes span all mapped competency domains and self-adjust difficulty based on your responses.",
    points: ["Adaptive difficulty engine", "18+ domain coverage", "Instant scoring & feedback"],
    accent: "#39ff14",
  },
  {
    icon: Route,
    tag: "LEARNING",
    title: "Personalised Learning Paths",
    desc: "Algorithmic generation of custom curricula optimised for rapid comprehension, recommending iGOT / NSSTA courses matched to your exact skill gap profile.",
    points: ["Priority-ranked course queue", "Gap-to-course matching", "Estimated time to proficiency"],
    accent: "#d05bff",
  },
  {
    icon: Radar,
    tag: "MAPPING",
    title: "Competency Mapping",
    desc: "Multi-dimensional skill matrix generation for precise talent alignment and role readiness scoring against official NCS / DoPT competency frameworks.",
    points: ["200+ domain taxonomy", "DoPT framework aligned", "Role readiness percentage"],
    accent: "#55f2ff",
  },
  {
    icon: Brain,
    tag: "AI TUTOR",
    title: "AI Tutor Chat",
    desc: "A conversational AI tutor guides you through complex statistical concepts with examples drawn from official Indian datasets — from GDP deflators to NSS survey design.",
    points: ["Context-aware conversation", "Official data examples", "Concept deep-dives on demand"],
    accent: "#39ff14",
  },
  {
    icon: BarChart3,
    tag: "ANALYTICS",
    title: "Analytics Dashboard",
    desc: "Org-wide competency heatmaps and trend analytics for training officers. Visualise workforce readiness across departments, ministries, and seniority bands at a glance.",
    points: ["Department-level heatmaps", "Time-series trend lines", "Export to PDF / CSV"],
    accent: "#d05bff",
  },
  {
    icon: ShieldCheck,
    tag: "SCORING",
    title: "Role Readiness Score",
    desc: "Instant, numerical readiness score for any target job role — benchmarked against the official NCS / DoPT competency framework — so officers know exactly where they stand.",
    points: ["0–100 readiness index", "Sub-domain breakdown", "Gap priority ranking"],
    accent: "#55f2ff",
  },
  {
    icon: BookOpen,
    tag: "CATALOGUE",
    title: "iGOT / NSSTA Integration",
    desc: "Curated government learning catalogue from iGOT Karmayogi and NSSTA training programmes, linked directly to competency gaps and surfaced at the right time.",
    points: ["1,200+ iGOT courses", "NSSTA programme alignment", "Direct enrolment flow"],
    accent: "#39ff14",
  },
  {
    icon: FlaskConical,
    tag: "DATA LAB",
    title: "Statistical Data Lab",
    desc: "Explore official MoSPI, NSSO, and Census datasets interactively. Run filters, generate charts, and export subsets — a learning sandbox built on real statistical data.",
    points: ["12+ official sources", "In-browser data explorer", "Chart & export tools"],
    accent: "#d05bff",
  },
  {
    icon: Users,
    tag: "ADMIN",
    title: "Admin & Workforce Intelligence",
    desc: "Training officers and HoDs get a command centre: assign training batches, monitor department progress, generate compliance reports, and align NSSTA programmes to real gaps.",
    points: ["Batch assignment engine", "Compliance reporting", "NSSTA programme mapping"],
    accent: "#55f2ff",
  },
];

const PILLARS = [
  { icon: Lock, label: "Gov-Grade Security", desc: "NIC-compliant data handling and role-based access control." },
  { icon: Globe, label: "Multilingual Ready", desc: "Interface and content localisation for all 22 scheduled languages." },
  { icon: Zap, label: "Offline-First PWA", desc: "Works on low-bandwidth connections with progressive sync." },
];

export default function FeaturesPage() {
  return (
    <>
      <div className="mesh-bg"></div>
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-32 min-h-[80vh]">

        {/* ── PAGE HEADER ── */}
        <section id="features" className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container text-xs">
            <Zap className="w-4 h-4" />
            CORE INFRASTRUCTURE
          </div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg font-bold text-on-surface tracking-tight">
            Everything StatIQ AI Can Do
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Built on a foundation of rigorous data science and machine learning logic. Nine purpose-built capabilities for India&apos;s statistical workforce.
          </p>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-panel glass-panel-interactive rounded-xl p-8 flex flex-col gap-6 relative overflow-hidden border-t-2"
                style={{ borderTopColor: feat.accent }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: `${feat.accent}15`, border: `1px solid ${feat.accent}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feat.accent }} />
                  </div>
                  <span
                    className="font-label-caps text-label-caps text-xs px-2 py-1 rounded-full"
                    style={{ color: feat.accent, border: `1px solid ${feat.accent}40`, background: `${feat.accent}10` }}
                  >
                    {feat.tag}
                  </span>
                </div>
                <div className="space-y-2">
                  <h2 className="font-headline-md text-base text-on-surface font-bold">{feat.title}</h2>
                  <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{feat.desc}</p>
                </div>
                <ul className="space-y-2 mt-auto pt-4 border-t border-white/5">
                  {feat.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2 text-xs text-on-surface-variant font-label-caps">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: feat.accent }} />
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl" style={{ background: `${feat.accent}08` }} />
              </div>
            );
          })}
        </section>

        {/* ── PILLARS ── */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">PLATFORM PRINCIPLES</p>
            <h2 className="font-display-lg-mobile text-display-lg-mobile font-bold text-on-surface">Built to Government Standards</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="glass-panel rounded-xl p-8 flex flex-col gap-4 items-center text-center glass-panel-interactive">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-container" />
                  </div>
                  <h3 className="font-headline-md text-base text-on-surface font-bold">{p.label}</h3>
                  <p className="text-sm text-on-surface-variant">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/15 via-surface-container to-secondary-container/15 z-0" />
          <div className="relative z-10 flex flex-col items-center justify-center text-center gap-6 py-20 px-8">
            <h2 className="font-display-lg-mobile text-display-lg-mobile font-bold text-on-surface tracking-tight">
              Ready to Try It?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Experience all nine features in the interactive demo — no installation required.
            </p>
            <Link href="/login" className="glow-button text-black px-10 py-4 rounded-xl font-label-caps text-label-caps font-bold tracking-widest inline-flex items-center gap-2">
              LAUNCH DEMO
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
