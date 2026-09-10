"use client";

import { useEffect, useState } from "react";
import type { DataSourceRecord } from "@/lib/integrations/registry";
import type { ProbeResult } from "@/lib/integrations/probe";
import { ArrowUpRight, ExternalLink, ShieldCheck, Activity, Database, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface LiveOverview {
  retrievedAt: string;
  counts: { live: number; registered: number };
  sources: Array<DataSourceRecord & { probe: ProbeResult }>;
}

function appPathForSource(id: string) {
  if (id.includes("esankhyiki") || id.includes("catalogue")) return "/catalogue";
  if (id.includes("nssta")) return "/training";
  if (id.includes("igot") || id.includes("karmayogi")) return "/courses";
  if (id.includes("unitdata") || id.includes("microdata")) return "/catalogue?source=MoSPI%20Microdata%20%2F%20UnitData";
  if (id.includes("mospi") || id.includes("wpi")) return "/statistics";
  return "/statistics";
}

export function SourceRegistryTable({
  sources,
  initialServerProbes = {},
}: {
  sources: DataSourceRecord[];
  initialServerProbes?: Record<string, ProbeResult>;
}) {
  const [live, setLive] = useState<LiveOverview | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/integrations/registry")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: LiveOverview | null) => {
        if (!ignore && data) {
          setLive(data);
          fetch("/api/v1/sources/mospi")
            .then((res) => (res.ok ? res.json() : null))
            .then((mospiData) => {
              if (!ignore && mospiData) {
                setLive((prev) => {
                  if (!prev) return prev;
                  const newSources = [...prev.sources];
                  const mospiIdx = newSources.findIndex((s) => s.id === "mospi-api");
                  if (mospiIdx >= 0) {
                    newSources[mospiIdx] = {
                      ...newSources[mospiIdx],
                      probe: {
                        ok: mospiData.status === "live",
                        mode: mospiData.status,
                        latencyMs: mospiData.latencyMs,
                        message: mospiData.message || mospiData.status,
                      },
                    };
                  }
                  return { ...prev, sources: newSources };
                });
              }
            })
            .catch(() => undefined);
          fetch("/api/v1/sources/unitdata")
            .then((res) => (res.ok ? res.json() : null))
            .then((unit) => {
              if (!ignore && unit) {
                setLive((prev) => {
                  if (!prev) return prev;
                  const newSources = [...prev.sources];
                  const idx = newSources.findIndex((s) => s.id === "unitdata");
                  if (idx >= 0) {
                    const status = String(unit.status ?? "ERROR");
                    newSources[idx] = {
                      ...newSources[idx],
                      probe: {
                        ok: status === "LIVE",
                        mode:
                          status === "LIVE"
                            ? "live"
                            : status === "NOT_CONFIGURED"
                              ? "authentication_error"
                              : "unreachable",
                        latencyMs: 0,
                        message: unit.health?.error || unit.status,
                      },
                    };
                  }
                  return { ...prev, sources: newSources };
                });
              }
            })
            .catch(() => undefined);
        }
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  const liveRowCount = live
    ? live.counts.live
    : Object.values(initialServerProbes).filter((p) => p.mode === "live").length;
  const registeredCount = live ? live.counts.registered : sources.length;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-surface-container-high/70 border-b border-outline-variant/30 text-on-surface font-label-caps uppercase">
            <tr>
              <th className="py-3 px-4">Source & Integration</th>
              <th className="py-3 px-4">Purpose / Domain</th>
              <th className="py-3 px-4">Access Configuration</th>
              <th className="py-3 px-4">Live Health Probe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-on-surface-variant">
            {sources.map((row) => {
              const probe =
                live?.sources.find((item) => item.id === row.id)?.probe ??
                initialServerProbes[row.id];
              return (
                <tr key={row.id} className="hover:bg-white/5 transition-colors align-top">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <a
                        className="font-display font-semibold text-sm text-on-surface hover:text-primary transition-colors inline-flex items-center gap-1"
                        href={row.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {row.source}
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </div>
                    <p className="mt-1 text-[11px] text-on-surface-variant/80">{row.integration}</p>
                    <div className="mt-2">
                      <Link
                        className="glow-button-secondary inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-label-caps uppercase font-bold"
                        href={appPathForSource(row.id)}
                      >
                        Open In StatIQ
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                  <td className="py-4 px-4 leading-relaxed">{row.purpose}</td>
                  <td className="py-4 px-4">
                    <code className="px-2 py-0.5 rounded-md bg-surface-container-high text-[11px] font-mono text-primary">
                      {row.access}
                    </code>
                  </td>
                  <td className="py-4 px-4">
                    {probe ? (
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-label-caps uppercase tracking-wider ${
                            probe.mode === "live"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : probe.mode === "authentication_error"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {probe.mode.replace("_", " ")}
                        </span>
                        <p className="text-[11px] font-mono text-on-surface-variant mt-1">
                          {probe.status ? `HTTP ${probe.status} · ` : ""}
                          {probe.latencyMs}ms · {probe.message}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-on-surface-variant font-label-caps">
                        {live ? "No probe result" : "Probing backend…"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs font-label-caps text-on-surface-variant">
        <span>
          {live
            ? `Live Pipelines: ${live.counts.live}/${live.counts.registered} · checked ${live.retrievedAt}`
            : `Pre-probed ${liveRowCount}/${registeredCount} sources from server`}
        </span>
        <span className="text-[10px]">Zero-Trust Proxy Architecture</span>
      </div>
    </div>
  );
}
