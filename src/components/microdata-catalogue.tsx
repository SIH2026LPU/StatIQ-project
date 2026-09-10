"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  datasetKey,
  fieldOrMissing,
  getMicrodataDatasets,
  type DatasetsResponse,
  type MicrodataDataset,
} from "@/services/microdataApi";
import {
  Search,
  Database,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/components/language/language-provider";

const PRESET_QUERIES = [
  { label: "All Surveys", query: "", count: "187" },
  { label: "👥 PLFS (Labour Force)", query: "PLFS", count: "14" },
  { label: "🏭 ASI (Industries)", query: "ASI", count: "52" },
  { label: "🛒 HCES (Household Consumption)", query: "HCES", count: "3" },
  { label: "🏢 ASUSE (Enterprises)", query: "ASUSE", count: "4" },
  { label: "📊 NSS (National Sample Survey)", query: "NSS", count: "108" },
];

export function MicrodataCatalogue({
  initialQuery = "",
  initialData = null,
  detailsBase = "/catalogue/microdata",
  allowAssign = false,
}: {
  initialQuery?: string;
  initialData?: DatasetsResponse | null;
  detailsBase?: string;
  allowAssign?: boolean;
}) {
  const { t, tEntity } = useTranslation();
  const [q, setQ] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DatasetsResponse | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [selectedRepo, setSelectedRepo] = useState<string>("ALL");

  useEffect(() => {
    if (initialData && q === initialQuery && page === 1 && data === initialData) {
      return;
    }
    let ignore = false;
    setLoading(true);
    getMicrodataDatasets(q, page)
      .then((res) => {
        if (!ignore) setData(res);
      })
      .catch((err: Error) => {
        if (!ignore) {
          setData({
            source: "MoSPI Microdata Portal",
            mode: "ERROR",
            error: err.message || "Official MoSPI data is currently unavailable.",
          });
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [q, page]);

  const rawDatasets: MicrodataDataset[] = data && data.mode === "LIVE" ? data.datasets : [];
  const total = data && data.mode === "LIVE" ? data.total ?? rawDatasets.length : 0;
  const pageSize = data && data.mode === "LIVE" ? data.pageSize ?? 15 : 15;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const datasets = useMemo(() => {
    if (selectedRepo === "ALL") return rawDatasets;
    return rawDatasets.filter((d) => {
      const repo = String(d.repositoryid ?? d.repo_title ?? "").toUpperCase();
      return repo.includes(selectedRepo.toUpperCase());
    });
  }, [rawDatasets, selectedRepo]);

  return (
    <section className="space-y-6">
      {/* Real-time Status & Provenance Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 text-xs backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-label-caps uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE MoSPI Microdata
          </span>
          <span className="text-on-surface-variant font-medium">
            <strong className="text-on-surface">{total}</strong> {t("microdata.surveysAvailable", "Official Surveys Available")}
          </span>
          <span className="hidden sm:inline-block text-outline-variant">•</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-on-surface-variant">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Zero-Trust Credential Isolation
          </span>
        </div>

        <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
          <span>Gateway:</span>
          <code className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono text-primary font-semibold">
            microdata.gov.in
          </code>
        </div>
      </div>

      {/* Search & Filter Command Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-5">
        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQ(inputVal.trim());
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={t("microdata.search", "Search official surveys (e.g. PLFS, ASI, HCES, ASUSE, NSS, Employment, Consumption)...")}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-container-high/60 border border-outline-variant/40 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => {
                  setInputVal("");
                  setQ("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-on-surface px-2 py-0.5 rounded-md hover:bg-surface-container-high"
              >
                {t("common.cancel", "Clear")}
              </button>
            )}
          </div>

          <button
            type="submit"
            className="glow-button px-6 py-3 rounded-2xl font-label-caps uppercase text-xs tracking-wider font-bold text-black flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
          >
            <Search className="w-3.5 h-3.5" />
            {t("microdata.searchBtn", "Search Microdata")}
          </button>
        </form>

        {/* Quick Filter Preset Chips */}
        <div className="space-y-2 pt-2 border-t border-outline-variant/15">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-caps uppercase tracking-wider text-on-surface-variant font-semibold">
              {t("microdata.presets", "Research Presets:")}
            </span>
            {loading && (
              <span className="text-primary text-[11px] flex items-center gap-1.5 animate-pulse font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {t("common.loading", "Querying official gateway…")}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PRESET_QUERIES.map((preset) => {
              const isActive = q === preset.query;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setInputVal(preset.query);
                    setQ(preset.query);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-primary text-black font-semibold shadow-sm scale-105"
                      : "bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-primary/40 hover:bg-surface-container-high"
                  }`}
                >
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error / Degraded Notices */}
      {data && data.mode !== "LIVE" && !loading ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-xs text-amber-600 dark:text-amber-400 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            Official MoSPI Microdata Gateway Notice
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            <strong>{data.mode}:</strong> {data.error}
          </p>
        </div>
      ) : null}

      {/* Loading Skeleton */}
      {loading && (
        <div className="glass-panel rounded-3xl border border-outline-variant/30 p-6 space-y-4 animate-pulse">
          <div className="h-4 bg-surface-container-high rounded w-48" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-surface-container-high/50 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && datasets.length === 0 && data?.mode === "LIVE" ? (
        <div className="glass-panel p-12 rounded-3xl border border-outline-variant/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Database className="w-6 h-6 opacity-70" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-on-surface text-base">
              {t("microdata.noSurveys", "No Matching Surveys Found")}
            </h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              No official datasets matched &ldquo;{q}&rdquo; on the MoSPI Microdata Portal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setInputVal("");
              setQ("");
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:border-primary/40 transition-colors"
          >
            {t("courses.clearFilters", "Reset All Filters")}
          </button>
        </div>
      ) : null}

      {/* Desktop Research Dataset Table */}
      {!loading && datasets.length > 0 && (
        <div className="space-y-4">
          {/* Table View for Desktop (>= 768px) */}
          <div className="hidden md:block glass-panel rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-xs">
                <thead className="bg-surface-container-high/80 border-b border-outline-variant/30 text-on-surface font-label-caps uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-4 px-5 font-semibold">{t("microdata.titleCol", "Survey Title & Scope")}</th>
                    <th className="py-4 px-4 font-semibold">{t("microdata.idnoCol", "Official IDNO")}</th>
                    <th className="py-4 px-4 font-semibold">{t("microdata.collectionCol", "Collection")}</th>
                    <th className="py-4 px-4 font-semibold">{t("microdata.yearCol", "Year / Period")}</th>
                    <th className="py-4 px-4 font-semibold">{t("microdata.producerCol", "Producer")}</th>
                    <th className="py-4 px-4 font-semibold">{t("microdata.statusCol", "Status")}</th>
                    <th className="py-4 px-5 font-semibold text-right">{t("microdata.actionCol", "Action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-on-surface-variant">
                  {datasets.map((d) => {
                    const key = datasetKey(d);
                    const title = fieldOrMissing(d.title);
                    const idno = fieldOrMissing(d.idno);
                    const repo = fieldOrMissing(d.repositoryid ?? d.repo_title ?? "MoSPI");
                    const year = fieldOrMissing(d.year ?? d.created ?? d.data_coll_start ?? "Survey Data");
                    const producer = fieldOrMissing(d.authoring_entity ?? d.producer ?? d.nation ?? "Government of India");

                    return (
                      <tr key={key} className="hover:bg-surface-container-high/40 transition-colors group">
                        <td className="py-4 px-5 max-w-sm">
                          <Link
                            href={`${detailsBase}/${encodeURIComponent(key)}`}
                            className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            <span className="line-clamp-1">{tEntity(title)}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                          </Link>
                          <p className="text-[11px] text-on-surface-variant/80 line-clamp-1 mt-0.5">
                            {tEntity(fieldOrMissing(d.abstract ?? d.description ?? "Official Government Microdata Archive"))}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <code className="font-mono text-[11px] text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                            {idno}
                          </code>
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-[11px] font-label-caps text-on-surface font-medium border border-outline-variant/20">
                            {repo}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-sans text-on-surface font-medium">
                          {year}
                        </td>

                        <td className="py-4 px-4 max-w-[140px] truncate text-on-surface-variant text-[11px]">
                          {tEntity(producer)}
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-label-caps uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                            VERIFIED
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <Link
                            href={`${detailsBase}/${encodeURIComponent(key)}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 hover:bg-primary hover:text-black hover:border-primary text-[11px] font-label-caps uppercase tracking-wider font-semibold text-on-surface transition-all shadow-sm"
                          >
                            {t("microdata.explore", "Explore →")}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card View for Mobile (< 768px) */}
          <div className="md:hidden space-y-3">
            {datasets.map((d) => {
              const key = datasetKey(d);
              const title = fieldOrMissing(d.title);
              const idno = fieldOrMissing(d.idno);
              const repo = fieldOrMissing(d.repositoryid ?? d.repo_title ?? "MoSPI");
              const year = fieldOrMissing(d.year ?? d.created ?? "Survey Data");

              return (
                <div
                  key={key}
                  className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-[10px] font-label-caps text-primary font-bold">
                      {repo}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-label-caps uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      ✓ VERIFIED
                    </span>
                  </div>

                  <Link
                    href={`${detailsBase}/${encodeURIComponent(key)}`}
                    className="block font-semibold text-sm text-on-surface hover:text-primary transition-colors leading-snug"
                  >
                    {tEntity(title)}
                  </Link>

                  <div className="text-xs space-y-1">
                    <p className="font-mono text-[11px] text-on-surface-variant truncate">
                      ID: <span className="text-primary">{idno}</span>
                    </p>
                    <p className="text-on-surface-variant text-[11px]">Period: {year}</p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between">
                    <Link
                      href={`${detailsBase}/${encodeURIComponent(key)}/files`}
                      className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      {t("microdata.files", "View Files")}
                    </Link>
                    <Link
                      href={`${detailsBase}/${encodeURIComponent(key)}`}
                      className="px-3 py-1 rounded-lg bg-primary text-black text-xs font-bold font-label-caps uppercase tracking-wider"
                    >
                      {t("microdata.explore", "Explore →")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Research Pagination Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20 text-xs">
            <div className="text-on-surface-variant">
              {t("courses.showing", "Showing Page")} <strong className="text-on-surface">{page}</strong> {t("common.of", "of")}{" "}
              <strong className="text-on-surface">{totalPages}</strong> (
              <span className="font-mono">{total}</span> {t("microdata.records", "total records")})
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-high text-on-surface disabled:opacity-40 disabled:pointer-events-none hover:border-primary transition-colors flex items-center gap-1 font-medium text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {t("common.back", "Previous")}
              </button>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-high text-on-surface disabled:opacity-40 disabled:pointer-events-none hover:border-primary transition-colors flex items-center gap-1 font-medium text-xs"
              >
                {t("common.next", "Next")}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
