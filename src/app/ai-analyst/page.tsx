import { AnalystClient } from "@/components/analyst-client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Sparkles, ShieldCheck, Database, Brain, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "AI Statistical Analyst — StatIQ AI",
  description: "Official statistics AI analyst grounded in MoSPI eSankhyiki, WPI, CPI, and PLFS records without synthetic fabrication.",
};

export default function AiAnalystPage() {
  return (
    <>
      <div className="mesh-bg" />
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[85vh] space-y-10">
        {/* Page Hero Header */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary-fixed-dim font-label-caps text-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary-container" />
            AI STATISTICAL INTELLIGENCE · ZERO FABRICATION
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                AI Statistical Data Analyst
              </h1>
              <p className="mt-3 text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Query official Indian government datasets in natural language.
                The model interprets authoritative records retrieved from PostgreSQL and verified MoSPI proxies — zero invented figures.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/statistics"
                className="glow-button-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-label-caps uppercase tracking-wider font-bold"
              >
                <Database className="w-4 h-4" />
                Browse Statistics
              </Link>
              <Link
                href="/lab"
                className="glow-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-label-caps uppercase tracking-wider font-bold text-black"
              >
                <Brain className="w-4 h-4" />
                Open Data Lab
              </Link>
            </div>
          </div>
        </section>

        {/* Interactive Query Client */}
        <AnalystClient />
      </main>

      <Footer />
    </>
  );
}
