import { notFound } from "next/navigation";
import { officialRepo } from "@/db/official-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DatasetWorkbench } from "@/components/dataset-workbench";
import { ensureOfficialData } from "@/lib/sync/ensure";
import { getOfficialDataset } from "@/lib/official-data-client";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  Database,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DatasetPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  await ensureOfficialData().catch(() => undefined);
  const { datasetId } = await params;
  const dataset = officialRepo.getDataset(datasetId);
  if (!dataset) notFound();

  const liveData = await getOfficialDataset(datasetId, {}, { dataset, pages: 1 });
  const all = liveData.mode === "ERROR" ? [] : liveData.records;

  const preview = all.slice(0, 50);
  const total = all.length;
  const displayRecordCount = liveData.mode === "ERROR"
    ? null
    : liveData.mode === "LIVE"
      ? liveData.totalRecordsAvailable
      : dataset.recordCount;
  const dataMode = liveData.mode;

  return (
    <>
      <div className="mesh-bg" />
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[85vh] space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-label-caps text-on-surface-variant">
          <Link href="/" className="hover:text-primary transition-colors">StatIQ AI</Link>
          <ChevronRight className="w-3 h-3 opacity-60" />
          <Link href="/statistics" className="hover:text-primary transition-colors">Official Statistics</Link>
          <ChevronRight className="w-3 h-3 opacity-60" />
          <span className="text-on-surface font-semibold">{dataset.name}</span>
        </nav>

        {/* Dataset Hero Section */}
        <section className="glass-panel p-8 rounded-3xl border border-outline-variant/30 relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-fixed-dim text-xs font-label-caps">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-container" />
                  {dataset.source}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-xs font-label-caps text-on-surface font-semibold">
                  Theme: {dataset.theme}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-label-caps uppercase font-bold tracking-wider ${
                    dataMode === "LIVE"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : dataMode === "ERROR"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : dataMode === "CACHED"
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {dataMode === "LIVE" ? "Live API Connected" : dataMode}
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
                {dataset.name}
              </h1>

              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                {dataset.description}
              </p>

              {/* Coverage & Metadata Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-label-caps text-on-surface-variant pt-2">
                <span>Coverage: <strong className="text-on-surface font-semibold">{dataset.referencePeriod}</strong></span>
                <span>·</span>
                <span>Sync: <strong className="text-on-surface font-semibold">{dataset.lastUpdated}</strong></span>
                <span>·</span>
                <span>
                  Official Records:{" "}
                  <strong className="text-primary font-semibold">
                    {displayRecordCount == null ? "unavailable" : displayRecordCount.toLocaleString()}
                  </strong>
                </span>
              </div>
            </div>

            {/* Action Quick Links */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/ai-analyst"
                className="glow-button inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                Query AI Analyst
              </Link>
              {dataset.sourceUrl ? (
                <a
                  href={dataset.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-button-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
                >
                  Official Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}
            </div>
          </div>

          {/* Warnings or Error Banners */}
          {liveData.warning ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{liveData.warning}</span>
            </div>
          ) : null}

          {liveData.error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Live Stream Notice:</span> {liveData.error}
                <p className="mt-1 text-on-surface-variant">
                  Retry the live request. Benchmark/sample series are not used on this path.
                </p>
              </div>
            </div>
          ) : null}
        </section>

        {/* Dataset Workbench Component */}
        <DatasetWorkbench
          dataset={dataset}
          records={all}
          preview={preview}
          total={total}
          liveTotal={liveData.totalRecordsAvailable}
          dataMode={dataMode}
          liveRetrievedAt={liveData.retrievedAt}
        />
      </main>

      <Footer />
    </>
  );
}
