"use client";

import Link from "next/link";
import { Notice, Stat } from "@/components/app-shell";
import { SyncNowButton } from "@/components/sync-now-button";
import { useTranslation } from "@/components/language/language-provider";
import {
  Database,
  RefreshCw,
  Server,
  Zap,
  ArrowUpRight,
} from "lucide-react";

interface HealthSource {
  source: string;
  role: string;
  status: string;
  isOk: boolean;
}

interface AdminDataViewProps {
  sources: HealthSource[];
  datasetsCount: number;
  totalRecords: number;
  coursesCount: number;
  programmesCount: number;
}

export function AdminDataView({
  sources,
  datasetsCount,
  totalRecords,
  coursesCount,
  programmesCount,
}: AdminDataViewProps) {
  const { t, tEntity } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-outline-variant/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-xs text-primary-container">
            <Database className="w-3.5 h-3.5" />
            {t("data.badge", "TELEMETRY & OFFICIAL DATA SYNCHRONIZATION")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            {t("admin.dataControlCenter", "Data Control Center")}
          </h1>
          <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
            {t("data.subtitle", "Monitor real-time pipeline health, execute manual synchronization with MoSPI endpoints, and inspect backend data stores.")}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/data-sources"
            className="glow-button-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
          >
            <Server className="w-4 h-4" />
            {t("data.probeRegistry", "Probe Registry")}
          </Link>
        </div>
      </header>

      {/* Featured MoSPI Live Data Explorer Card */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-primary-container/30 relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-label-caps font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t("data.liveMcpBadge", "LIVE GOVERNMENT FAST-MCP INTEGRATION")}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface">
              {t("admin.mospiDataExplorer", "MoSPI Live Data Explorer")}
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
              {t("data.explorerDesc", "Query 27+ authoritative datasets (PLFS, CPI, WPI, NAS, IIP, ASI) via the local eSankhyiki MCP server. Zero synthetic fabrication — live records streamed directly from official endpoints.")}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                t("data.tagUnemployment", "Unemployment (PLFS)"),
                t("data.tagCpi", "CPI Inflation"),
                t("data.tagGdp", "GDP / NAS"),
                t("data.tagWpi", "WPI Prices"),
                t("data.tagIip", "IIP Manufacturing"),
                t("data.tagEnergy", "Energy Statistics"),
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-surface-container-high px-2.5 py-1 text-xs font-label-caps text-on-surface-variant border border-outline-variant/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              href="/admin/data/mospi-explorer"
              className="glow-button inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-lg"
            >
              <Zap className="w-4 h-4" />
              {t("data.launchExplorer", "Launch Explorer")}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Manual Sync Trigger Ribbon */}
      <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">
              {t("data.executeManualSync", "Execute Manual Sync Cycle")}
            </p>
            <p className="text-xs text-on-surface-variant">
              {t("data.syncDesc", "Triggers background sync across MoSPI WPI and HTML ingest crawlers")}
            </p>
          </div>
        </div>
        <SyncNowButton source="WPI" />
      </div>

      {/* Core Services Health Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-on-surface">
            {t("data.pipelineHealth", "Pipeline & Infrastructure Health")}
          </h2>
          <span className="text-xs font-label-caps text-on-surface-variant">
            {t("data.liveVerification", "Live Socket Verification")}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sources.map((src) => (
            <div
              key={src.source}
              className="glass-panel p-5 rounded-2xl border border-outline-variant/30 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="font-semibold text-sm text-on-surface">{tEntity(src.source)}</p>
                <p className="text-xs text-on-surface-variant">{tEntity(src.role)}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-label-caps font-bold uppercase tracking-wider shrink-0 ${
                  src.isOk
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                {tEntity(src.status)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Dataset Statistics */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-on-surface">
          {t("data.inventoryCounts", "Dataset Inventory Counts")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label={t("data.officialDatasets", "Official Datasets")}
            value={String(datasetsCount)}
            hint={t("data.registeredDomainsHint", "Registered MoSPI domains")}
          />
          <Stat
            label={t("data.liveCachedRecords", "Live Cached Records")}
            value={totalRecords > 0 ? totalRecords.toLocaleString() : t("data.dynamic", "Dynamic")}
            hint={t("data.inPostgresHint", "In PostgreSQL store")}
          />
          <Stat
            label={t("data.learningCourses", "Learning Courses")}
            value={String(coursesCount)}
            hint={t("data.mappedCompetenciesHint", "Mapped to competencies")}
          />
          <Stat
            label={t("data.trainingPrograms", "Training Programs")}
            value={String(programmesCount)}
            hint={t("data.nsstaModulesHint", "NSSTA / TPAC modules")}
          />
        </div>
      </section>
    </div>
  );
}
