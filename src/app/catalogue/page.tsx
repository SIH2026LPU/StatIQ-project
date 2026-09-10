import { db } from "@/db/store";
import { officialRepo } from "@/db/official-store";
import { EmptyData } from "@/components/public-chrome";
import { ensureOfficialData } from "@/lib/sync/ensure";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getBackendMospiHealth } from "@/lib/official-data-client";
import { MicrodataCatalogue } from "@/components/microdata-catalogue";
import Link from "next/link";
import { Search, Filter, ShieldCheck, Database, Layers, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Data Catalogue — StatIQ AI" };

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string; theme?: string; year?: string; frequency?: string }>;
}) {
  // Fire sync in the background — do NOT await it. syncMospi() can take 60 s+
  // (full MoSPI upstream round-trip). Blocking the render on it causes the
  // 68-72 s page load and the "destination stream closed early" RSC error.
  // The catalogue only needs the in-memory repo (seeded at startup); live WPI
  // status is shown separately via the liveStatuses probe below.
  void ensureOfficialData().catch(() => undefined);
  const params = await searchParams;
  let rows = officialRepo.listDatasets({
    q: params.q,
    source: params.source,
    theme: params.theme,
  });
  if (params.year) rows = rows.filter((row) => row.year === params.year || row.lastUpdated.startsWith(params.year!));
  if (params.frequency) rows = rows.filter((row) => row.frequency === params.frequency);
  const sources = [...new Set(officialRepo.listDatasets().map((r) => r.source))];
  const themes = [...new Set(officialRepo.listDatasets().map((r) => r.theme))];

  const courses = db.listCourses().filter((course) => course.provider === "igot");
  const programmes = db.listProgrammes();
  const mospiHealth = await getBackendMospiHealth().catch(() => ({
    authenticated: false,
    status: "backend_unreachable",
    latencyMs: 0,
  }));

  // The live-status probe calls fetchWPILive which can take 60 s+ on a cold
  // cache. We skip it on the catalogue render — the Lab / Statistics pages do
  // the full live probe on demand. The catalogue "Live Mode" column now shows
  // a static badge derived from the dataset's accessType, which is accurate
  // and renders instantly.
  const liveStatuses = new Map<string, { mode: string; liveRecordCount: number; cachedRecordCount: number; lastChecked: string; error?: string }>();

  const initialMicrodata = await fetch("http://127.0.0.1:4000/api/microdata/datasets?page=1", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })
    .then((r) => r.json())
    .catch(() => null);

  return (
    <>
      <div className="mesh-bg" />
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[80vh] space-y-16">
        {/* Top Feature Section: Adaptors & Programmes */}
        <section id="catalog" className="grid gap-8 lg:grid-cols-2">
          <div className="glass-panel p-8 rounded-3xl border border-outline-variant/30">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-secondary-container/30 bg-secondary-container/10 text-secondary-fixed-dim font-label-caps text-xs">
              IGOT ADAPTER
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Mock Karmayogi Catalogue</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Same domain model as production. Adapter maps to competency passports and skill-gap training.
            </p>

            <ul className="space-y-3">
              {courses.slice(0, 4).map((course) => (
                <li
                  key={course.id}
                  className="p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/20 hover:border-primary-container/40 transition-colors"
                >
                  <p className="font-semibold text-on-surface text-sm">{course.title}</p>
                  <p className="mt-1 text-xs text-on-surface-variant line-clamp-2">{course.description}</p>
                  <p className="mt-2 text-[11px] text-secondary-fixed-dim font-label-caps">
                    {course.durationHours}h · {course.sourceUrl}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-outline-variant/30">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-tertiary-container/30 bg-tertiary-container/10 text-tertiary-fixed-dim font-label-caps text-xs">
              NSSTA / TPAC
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Recommended Programmes</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Mapped to survey design, sampling, national accounts and official data science workflows.
            </p>

            <ul className="space-y-3">
              {programmes.slice(0, 4).map((programme) => (
                <li
                  key={programme.id}
                  className="p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/20 hover:border-tertiary-container/40 transition-colors"
                >
                  <p className="font-semibold text-on-surface text-sm">{programme.title}</p>
                  <p className="mt-1 text-xs text-on-surface-variant line-clamp-2">{programme.description}</p>
                  <p className="mt-2 text-[11px] text-tertiary-fixed-dim font-label-caps">
                    {programme.durationDays ? `${programme.durationDays} days · ` : ""}
                    {programme.targetDesignation}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Main Data Catalogue Section */}
        <section className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary-fixed-dim font-label-caps text-xs">
                <Database className="w-3.5 h-3.5 text-primary-container" />
                VERIFIED OFFICIAL REPOSITORY
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
                Statistical Data Catalogue
              </h1>
              <p className="mt-2 text-on-surface-variant text-sm md:text-base leading-relaxed">
                PostgreSQL synchronizes catalogue definitions. Live datasets stream via the server-side MoSPI proxy with real-time token isolation.
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-outline-variant/30 text-right space-y-1.5 max-w-sm">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-label-caps uppercase tracking-wider ${
                  mospiHealth.authenticated
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : mospiHealth.status === "backend_unreachable"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                MoSPI Proxy: {mospiHealth.authenticated ? "Live & Ready" : mospiHealth.status}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {mospiHealth.authenticated
                  ? `Auth verified${"tokenExpiresInSeconds" in mospiHealth && mospiHealth.tokenExpiresInSeconds ? ` · token expires in ${mospiHealth.tokenExpiresInSeconds}s` : ""} — FastMCP 3.3 server active.`
                  : mospiHealth.status === "backend_unreachable"
                  ? "StatIQ backend proxy offline. Displaying local catalogue metadata."
                  : `MoSPI status: ${mospiHealth.status}`}
              </p>
            </div>
          </div>

          {/* Search & Filter Form */}
          <form className="grid gap-3 md:grid-cols-5 glass-panel p-4 rounded-2xl border border-outline-variant/30" method="get">
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Search datasets..."
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-high/60 pl-9 pr-3 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <select
              name="source"
              defaultValue={params.source ?? ""}
              className="rounded-xl border border-outline-variant/40 bg-surface-container-high/60 px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">All Sources</option>
              <option value="MoSPI Microdata / UnitData">MoSPI Microdata / UnitData</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <select
              name="theme"
              defaultValue={params.theme ?? ""}
              className="rounded-xl border border-outline-variant/40 bg-surface-container-high/60 px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">All Themes</option>
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>

            <input
              name="year"
              defaultValue={params.year}
              placeholder="Year (e.g. 2025)"
              className="rounded-xl border border-outline-variant/40 bg-surface-container-high/60 px-3 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
            />

            <button className="glow-button rounded-xl text-black font-bold text-xs font-label-caps uppercase tracking-wider px-4 py-2.5 shadow-md">
              Apply Filters
            </button>
          </form>

          {params.source === "MoSPI Microdata / UnitData" || params.source === "unitdata" ? (
            <div className="mt-8 space-y-4">
              <h2 className="font-display text-2xl font-bold text-on-surface">MoSPI Microdata / UnitData</h2>
              <p className="text-sm text-on-surface-variant">
                Live catalogue from microdata.gov.in via the StatIQ backend. This is not the MoSPI Statistics API (WPI/CPI/IIP).
              </p>
              <MicrodataCatalogue initialQuery={params.q ?? ""} initialData={initialMicrodata} />
            </div>
          ) : (
            <>
              {rows.length === 0 ? (
                <EmptyData hint="Catalogue metadata loads via ensureOfficialData(). Open /statistics to trigger a live fetch from the official backend proxy." />
              ) : (
                <div className="glass-panel rounded-2xl border border-outline-variant/30 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-left text-xs">
                      <thead className="bg-surface-container-high/70 border-b border-outline-variant/30 text-on-surface font-label-caps uppercase">
                        <tr>
                          <th className="px-4 py-3.5 font-semibold">Dataset</th>
                          <th className="px-4 py-3.5 font-semibold">Source</th>
                          <th className="px-4 py-3.5 font-semibold">Category</th>
                          <th className="px-4 py-3.5 font-semibold">Frequency</th>
                          <th className="px-4 py-3.5 font-semibold">Reference Period</th>
                          <th className="px-4 py-3.5 font-semibold">Last Metadata Sync</th>
                          <th className="px-4 py-3.5 font-semibold">Cache Rows</th>
                          <th className="px-4 py-3.5 font-semibold">Live Mode</th>
                          <th className="px-4 py-3.5 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/15 text-on-surface-variant">
                        {rows.map((row) => {
                          const live = liveStatuses.get(row.id);
                          return (
                            <tr key={row.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-4 max-w-xs">
                                <Link
                                  className="text-primary hover:underline font-semibold text-sm flex items-center gap-1 group"
                                  href={`/statistics/${row.id}`}
                                >
                                  {row.name}
                                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-1">{row.description}</p>
                              </td>
                              <td className="px-4 py-4">{row.source}</td>
                              <td className="px-4 py-4">
                                <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-[10px] font-label-caps">
                                  {row.category}
                                </span>
                              </td>
                              <td className="px-4 py-4">{row.frequency}</td>
                              <td className="px-4 py-4">{row.referencePeriod}</td>
                              <td className="px-4 py-4 font-mono text-[11px]">{row.lastUpdated}</td>
                              <td className="px-4 py-4 font-mono font-semibold text-on-surface">
                                {row.recordCount.toLocaleString()}
                              </td>
                              <td className="px-4 py-4">
                                {live ? (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-label-caps uppercase tracking-wider ${
                                      live.mode === "LIVE"
                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                        : live.mode === "ERROR"
                                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    }`}
                                  >
                                    {live.mode}
                                  </span>
                                ) : row.source === "MoSPI API Platform" ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-label-caps uppercase bg-sky-500/10 text-sky-500 border border-sky-500/20">
                                    Live API
                                  </span>
                                ) : (
                                  <span className="text-on-surface-variant/60 text-[11px]">Synced Cache</span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <Link
                                  href={`/statistics/${row.id}`}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-outline-variant/40 bg-surface-container-high/40 hover:bg-surface-container-high text-[11px] font-label-caps text-on-surface transition-colors"
                                >
                                  Workbench
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* MoSPI Microdata Section */}
          <div className="mt-16 space-y-4 pt-12 border-t border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-secondary-container/10 border border-secondary-container/30 text-secondary-fixed-dim text-xs font-label-caps">
                MICRODATA INGESTION
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface">MoSPI Microdata / UnitData</h2>
            <p className="text-sm text-on-surface-variant">
              Survey microdata catalogs from <code>microdata.gov.in</code> via the StatIQ backend proxy.
            </p>
            <MicrodataCatalogue initialQuery={params.q ?? ""} initialData={initialMicrodata} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
