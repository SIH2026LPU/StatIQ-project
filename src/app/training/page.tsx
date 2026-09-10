import { db } from "@/db/store";
import { officialRepo } from "@/db/official-store";
import { getIGOTProvider } from "@/lib/integrations/igot";
import { ensureOfficialData } from "@/lib/sync/ensure";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  Building,
  Award,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Training Programmes — StatIQ AI",
  description: "Official National Statistical Systems Training Academy (NSSTA) & iGOT programmes mapped to official workforce competencies.",
};

export default async function TrainingPage() {
  await ensureOfficialData().catch(() => undefined);
  const igotStatus = getIGOTProvider().status();
  const demo = db.listProgrammes();
  const ingested = officialRepo.listDatasets({ theme: "Training" });

  return (
    <>
      <div className="mesh-bg" />
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[85vh] space-y-16">
        {/* Page Hero Header */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary-container/30 bg-secondary-container/10 text-secondary-fixed-dim font-label-caps text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-secondary-container" />
            WORKFORCE TRAINING PIPELINES
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                Training Programmes & Curricula
              </h1>
              <p className="mt-3 text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Official NSSTA training calendar, TPAC certifications, and adaptive competency programmes tailored for statistical cadres across India.
              </p>
            </div>

            <div className="glass-panel px-4 py-2.5 rounded-2xl border border-outline-variant/30 flex items-center gap-2 text-xs font-label-caps text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Status: <strong className="text-on-surface">iGOT Active ({igotStatus})</strong></span>
            </div>
          </div>
        </section>

        {/* NSSTA Official Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-on-surface">
                NSSTA Academy Programmes
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Official institutional training modules from National Statistical Systems Training Academy
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-label-caps text-primary">
              Official Ingest
            </span>
          </div>

          {ingested.length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl border border-outline-variant/30 text-center space-y-2">
              <p className="text-sm font-semibold text-on-surface">No live NSSTA titles synced in this cycle</p>
              <p className="text-xs text-on-surface-variant">
                Synchronized metadata updates via official HTML ingest schedules.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {ingested.map((row) => (
                <div
                  key={row.id}
                  className="glass-panel glass-panel-interactive p-7 rounded-3xl border border-outline-variant/30 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-1 rounded-md bg-tertiary-container/10 border border-tertiary-container/30 text-tertiary-fixed-dim text-[10px] font-label-caps font-bold">
                      NSSTA OFFICIAL
                    </span>
                    <h3 className="font-display text-lg font-bold text-on-surface mt-2">{row.name}</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{row.description}</p>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-on-surface-variant">ID: {row.id}</span>
                    <a
                      href={row.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="glow-button-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
                    >
                      Portal Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Competency Loop Seed Programmes */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-on-surface">
                Competency Gap Training Modules
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Specialized tracks linked directly to competency loop diagnostics
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-label-caps text-secondary-fixed-dim">
              Adaptive Tracks
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demo.map((row) => (
              <div
                key={row.id}
                className="glass-panel glass-panel-interactive p-7 rounded-3xl border border-outline-variant/30 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-secondary-container/10 border border-secondary-container/30 text-secondary-fixed-dim text-[10px] font-label-caps font-bold uppercase">
                      {row.provider}
                    </span>
                    {row.durationDays ? (
                      <span className="text-[11px] font-label-caps text-on-surface-variant flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {row.durationDays} Days
                      </span>
                    ) : null}
                  </div>

                  <h3 className="font-display text-lg font-bold text-on-surface leading-snug">{row.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{row.description}</p>
                </div>

                <div className="pt-4 border-t border-outline-variant/20 space-y-3">
                  <div className="text-[11px] font-label-caps text-on-surface-variant">
                    Target Cadre: <strong className="text-on-surface">{row.targetDesignation || "All Statistical Officers"}</strong>
                  </div>
                  <Link
                    href="/courses"
                    className="glow-button-secondary w-full py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    View Course Modules
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
