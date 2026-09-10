import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Database, ArrowRight, ShieldCheck } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-black font-display font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
            Σ
          </span>
          <span>
            <span className="block font-display text-lg font-bold text-on-surface tracking-tight">StatIQ AI</span>
            <span className="block text-[11px] font-label-caps text-on-surface-variant tracking-wider">SIH 2026 · PS 26101</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-5 text-sm font-medium">
          <Link href="/catalogue" className="text-on-surface-variant hover:text-primary transition-colors">Catalogue</Link>
          <Link href="/statistics" className="text-on-surface-variant hover:text-primary transition-colors">Statistics</Link>
          <Link href="/lab" className="text-on-surface-variant hover:text-primary transition-colors">Lab</Link>
          <Link href="/ai-analyst" className="text-on-surface-variant hover:text-primary transition-colors">AI Analyst</Link>
          <Link href="/courses" className="text-on-surface-variant hover:text-primary transition-colors">Courses</Link>
          <Link href="/training" className="text-on-surface-variant hover:text-primary transition-colors">Training</Link>
          <div className="flex items-center gap-3 ml-2">
            <ThemeToggle />
            <Link href="/login" className="glow-button px-5 py-2 rounded-full font-label-caps text-xs font-bold text-black scale-95 active:scale-90 transition-transform">
              Sign In
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function EmptyData({
  title = "No synchronized data available yet.",
  hint,
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="glass-panel mt-6 rounded-2xl p-8 text-center border border-outline-variant/30">
      <div className="w-12 h-12 rounded-2xl bg-surface-container-high mx-auto flex items-center justify-center text-primary-fixed-dim mb-4 border border-outline-variant/40">
        <Database className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-on-surface">{title}</h3>
      {hint ? <p className="mt-2 text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">{hint}</p> : null}
      <div className="mt-6 flex justify-center gap-4">
        <Link href="/admin/data-sources" className="glow-button-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-label-caps uppercase tracking-wider font-bold">
          Open Data Sources / Sync Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
