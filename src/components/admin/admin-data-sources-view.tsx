"use client";

import { Notice } from "@/components/app-shell";
import { SyncNowButton } from "@/components/sync-now-button";
import { useTranslation } from "@/components/language/language-provider";
import {
  Server,
  ExternalLink,
} from "lucide-react";

interface SourceHealthItem {
  source: string;
  officialUrl: string;
  status: string;
  lastSync?: string | null;
  lastSuccess?: string | null;
  lastError?: string | null;
  recordCount: number;
}

interface AdminDataSourcesViewProps {
  sources: SourceHealthItem[];
}

export function AdminDataSourcesView({ sources }: AdminDataSourcesViewProps) {
  const { t, tEntity } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-outline-variant/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary-container/30 bg-secondary-container/10 font-label-caps text-xs text-secondary-fixed-dim">
            <Server className="w-3.5 h-3.5" />
            {t("dataSources.badge", "OFFICIAL INTEGRATIONS TELEMETRY")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            {t("nav.dataSources", "Data Source Telemetry")}
          </h1>
          <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
            {t("dataSources.subtitle", "Real-time status probes across MoSPI, eSankhyiki, iGOT Karmayogi, and NSSTA APIs. Zero-trust validation protocol.")}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <SyncNowButton />
        </div>
      </header>

      {/* Source Cards */}
      <section className="grid gap-6 md:grid-cols-2">
        {sources.map((src) => {
          const isLive =
            src.status === "CONNECTED" ||
            src.status === "LIVE & AUTHENTICATED" ||
            src.status === "DELEGATED_TO_BACKEND";
          const isDegraded = src.status === "DEGRADED" || src.status === "MOCK";

          return (
            <div
              key={src.source}
              className="glass-panel glass-panel-interactive p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-on-surface">
                    {tEntity(src.source)}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-label-caps uppercase font-bold tracking-wider ${
                      isLive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : isDegraded
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {tEntity(src.status)}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-on-surface-variant">
                  <p>
                    {t("dataSources.lastSync", "Last Sync")}:{" "}
                    <strong className="text-on-surface font-mono">
                      {src.lastSync ? new Date(src.lastSync).toLocaleString() : "—"}
                    </strong>
                  </p>
                  <p>
                    {t("dataSources.lastSuccessful", "Last Successful")}:{" "}
                    <strong className="text-on-surface font-mono">
                      {src.lastSuccess ? new Date(src.lastSuccess).toLocaleString() : "—"}
                    </strong>
                  </p>
                  <p>
                    {t("dataSources.recordsSynced", "Records Synced")}:{" "}
                    <strong className="text-primary font-mono">{src.recordCount}</strong>
                  </p>
                </div>

                {src.lastError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                    {src.lastError}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <a
                  href={src.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="glow-button-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-label-caps uppercase font-bold"
                >
                  {t("dataSources.officialPortal", "Official Portal")}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
