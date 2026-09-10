import { getRegistrySnapshot } from "@/lib/integrations/catalog";
import { SourceRegistryTable } from "@/components/source-probe-status";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getBackendHealth } from "@/lib/backend";
import { getBackendMospiHealth } from "@/lib/official-data-client";
import type { ProbeResult } from "@/lib/integrations/probe";

export const metadata = {
  title: "Data Sources - StatIQ AI",
};

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const overview = getRegistrySnapshot();
  const health = await getBackendHealth();
  const mospiHealth = await getBackendMospiHealth();
  const unitdata = health?.services?.mospi_unitdata;

  const initialServerProbes: Record<string, ProbeResult> = {};
  if (mospiHealth.authenticated) {
    initialServerProbes["mospi-api"] = {
      ok: true,
      mode: "live",
      latencyMs: mospiHealth.latencyMs || 0,
      message: "Official MoSPI API Authenticated & Live (back-end verified)",
      status: 200,
    };
  } else if (mospiHealth.status === "backend_unreachable") {
    initialServerProbes["mospi-api"] = {
      ok: false,
      mode: "unreachable",
      latencyMs: 0,
      message: `StatIQ backend unreachable — ${mospiHealth.error || "offline"}`,
      status: 0,
    };
  } else {
    initialServerProbes["mospi-api"] = {
      ok: false,
      mode: "authentication_error",
      latencyMs: mospiHealth.latencyMs || 0,
      message: mospiHealth.error || "MoSPI authentication failed — check back-end token",
      status: 401,
    };
  }

  if (unitdata?.status === "healthy") {
    initialServerProbes["unitdata"] = {
      ok: true,
      mode: "live",
      latencyMs: unitdata.latencyMs || 0,
      message: "MoSPI Microdata / UnitData live via StatIQ backend",
      status: 200,
    };
  } else if (unitdata?.status === "not_configured") {
    initialServerProbes["unitdata"] = {
      ok: false,
      mode: "authentication_error",
      latencyMs: unitdata.latencyMs || 0,
      message: unitdata.error || "MOSPI_UNITDATA_API_KEY is not configured",
      status: 503,
    };
  } else {
    initialServerProbes["unitdata"] = {
      ok: false,
      mode: health?.status === "error" ? "backend_unreachable" : "unreachable",
      latencyMs: unitdata?.latencyMs || 0,
      message: unitdata?.error || "Official MoSPI data is currently unavailable.",
      status: 0,
    };
  }

  return (
    <>
      <div className="mesh-bg"></div>
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[80vh]">
        <section id="sources" className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-10">
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface font-bold">Data Sources</h1>
            <p className="font-body-lg text-on-surface-variant">
              Official sources, adapter-first. {overview.provenance}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="text-on-surface-variant">
                PostgreSQL backend: {health?.status === "healthy" || health?.status === "ok" ? `ONLINE` : `offline — ${health?.error || "undefined"}`}
              </span>
              <span
                className={
                  mospiHealth.authenticated
                    ? "rounded-sm bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900 font-bold uppercase tracking-wider"
                    : mospiHealth.status === "backend_unreachable"
                      ? "rounded-sm bg-amber-100 px-2 py-0.5 text-xs text-amber-950 font-bold uppercase tracking-wider"
                      : "rounded-sm bg-red-100 px-2 py-0.5 text-xs text-red-900 font-bold uppercase tracking-wider"
                }
              >
                MoSPI API: {mospiHealth.authenticated ? "Authenticated & Live" : mospiHealth.status === "backend_unreachable" ? "Back-end unreachable" : "Auth failed"}
              </span>
              <span className="rounded-sm bg-surface px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                MoSPI Microdata: {unitdata?.status ?? "unknown"}
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden shadow-2xl border border-white/10 p-6">
            <SourceRegistryTable sources={overview.sources} initialServerProbes={initialServerProbes} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
