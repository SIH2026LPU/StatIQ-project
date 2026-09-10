import { officialRepo } from "@/db/official-store";
import { LabClient } from "@/components/lab-client";
import { EmptyData } from "@/components/public-chrome";
import { ensureOfficialData } from "@/lib/sync/ensure";
import { getBackendMospiHealth } from "@/lib/official-data-client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FlaskConical, ShieldCheck, Database, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Statistical Data Lab — StatIQ AI",
  description: "Interactive statistical workbench for filtering, aggregating, and analyzing official MoSPI, NSSO, and eSankhyiki datasets.",
};

export default async function LabPage() {
  await ensureOfficialData().catch(() => undefined);
  const datasets = officialRepo.listDatasets();
  const mospiHealth = await getBackendMospiHealth().catch(() => ({
    authenticated: false,
    status: "unknown",
    latencyMs: 0,
  }));

  return (
    <>
      <div className="mesh-bg" />
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[85vh] space-y-10">
        {/* Page Hero Header */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary-fixed-dim font-label-caps text-xs">
            <FlaskConical className="w-3.5 h-3.5 text-primary-container" />
            OFFICIAL STATISTICAL WORKBENCH
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                Statistical Data Lab
              </h1>
              <p className="mt-3 text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Analyze official Indian macroeconomic and survey records in real-time. Compute descriptive statistics, group distributions, and time-series series dynamically.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/statistics"
                className="glow-button-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-label-caps uppercase tracking-wider font-bold"
              >
                <Database className="w-4 h-4" />
                Browse Hub
              </Link>
              <Link
                href="/ai-analyst"
                className="glow-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-label-caps uppercase tracking-wider font-bold text-black"
              >
                Ask AI Analyst
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {datasets.length === 0 ? <EmptyData /> : <LabClient datasets={datasets} />}
      </main>

      <Footer />
    </>
  );
}
