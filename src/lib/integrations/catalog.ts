import { PUBLIC_CATALOGUE, probeUrl, type ProbeResult } from "@/lib/integrations/probe";
import {
  loadDataSourceRegistry,
  type DataSourceRecord,
} from "@/lib/integrations/registry";
import { getIGOTProvider } from "@/lib/integrations/igot";
import { getNSSTAProvider } from "@/lib/integrations/nssta";

export const PROVENANCE =
  "Official portals are the source of truth. AI does not invent official statistics. iGOT uses a mock provider until authorized credentials exist.";

const TTL_MS = 10 * 60 * 1000;

type Overview = {
  retrievedAt: string;
  provenance: string;
  sources: Array<DataSourceRecord & { probe: ProbeResult }>;
  counts: { registered: number; live: number; fallback: number };
};

let cachedOverview: { expires: number; data: Overview } | null = null;
let inflightOverview: Promise<Overview> | null = null;

export function getRegistrySnapshot() {
  const registry = loadDataSourceRegistry();
  return {
    retrievedAt: null as string | null,
    provenance: PROVENANCE,
    sources: registry.map((source) => ({
      ...source,
      probe: {
        ok: false,
        latencyMs: 0,
        mode: "cached-catalogue" as const,
        message: "Idle — live probe runs only from /api/integrations/registry (cached 10 min).",
      },
    })),
    counts: {
      registered: registry.length,
      live: 0,
      fallback: registry.length,
    },
  };
}

export async function getIntegrationOverview() {
  if (cachedOverview && cachedOverview.expires > Date.now()) {
    return cachedOverview.data;
  }
  if (inflightOverview) return inflightOverview;

  inflightOverview = (async () => {
    const registry = loadDataSourceRegistry();
    const probes = await Promise.all(
      registry.map(async (source) => {
        if (source.id === "mospi-api") {
          try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://127.0.0.1:4000";
            const mospiRes = await fetch(`${BACKEND_URL}/api/sources/mospi`, {
              cache: "no-store",
              signal: AbortSignal.timeout(10_000),
            });
            const mospiData = await mospiRes.json();
            
            if (mospiData?.status === "live") {
              return { ...source, probe: { ok: true, latencyMs: mospiData.latencyMs || 0, mode: "live", message: mospiData.message || "Official MoSPI API Authenticated (HTTP 200)" } as ProbeResult };
            } else if (mospiData?.status === "authentication_error") {
              return { ...source, probe: { ok: false, latencyMs: mospiData.latencyMs || 0, mode: "authentication_error", message: "AUTHENTICATION ERROR: Token expired or invalid" } as any };
            } else {
              return { ...source, probe: { ok: false, latencyMs: mospiData.latencyMs || 0, mode: "unreachable", message: mospiData?.message || "UNREACHABLE" } as ProbeResult };
            }
          } catch (e: any) {
            return { ...source, probe: { ok: false, latencyMs: 0, mode: "unreachable", message: "StatIQ Backend Offline" } as ProbeResult };
          }
        }
        if (source.id === "unitdata") {
          try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://127.0.0.1:4000";
            const unitRes = await fetch(`${BACKEND_URL}/api/sources/unitdata`, {
              cache: "no-store",
              signal: AbortSignal.timeout(10_000),
            });
            const unitData = await unitRes.json();
            const status = String(unitData?.status ?? "ERROR");
            const ok = status === "LIVE";
            return {
              ...source,
              probe: {
                ok,
                latencyMs: 0,
                mode: ok ? "live" : status === "NOT_CONFIGURED" ? "authentication_error" : "unreachable",
                message: unitData?.health?.error || unitData?.status || "MoSPI UnitData",
              } as ProbeResult,
            };
          } catch {
            return {
              ...source,
              probe: {
                ok: false,
                latencyMs: 0,
                mode: "backend_unreachable",
                message: "StatIQ backend offline — UnitData health not probed from the browser.",
              } as ProbeResult,
            };
          }
        }
        return {
          ...source,
          probe: await probeUrl(source.officialUrl),
        };
      })
    );
    const data: Overview = {
      retrievedAt: new Date().toISOString(),
      provenance: PROVENANCE,
      sources: probes,
      counts: {
        registered: registry.length,
        live: probes.filter((item) => item.probe.mode === "live").length,
        fallback: probes.filter((item) => item.probe.mode !== "live").length,
      },
    };
    cachedOverview = { expires: Date.now() + TTL_MS, data };
    inflightOverview = null;
    return data;
  })().catch((error) => {
    inflightOverview = null;
    throw error;
  });

  return inflightOverview;
}

function registrySource(id: string) {
  const registry = loadDataSourceRegistry();
  return (
    registry.find((item) => item.id === id) ??
    registry.find((item) => item.id.includes(id) || id.includes(item.id))
  );
}

export async function getSourcePayload(id: string) {
  const source = registrySource(id);
  if (!source) return null;

  if (id.includes("mospi") && !id.includes("unit")) {
    return {
      source,
      liveRecords: false,
      products: PUBLIC_CATALOGUE.mospiProducts,
      records: null,
      warning:
        "WPI micro-records are not shown without MOSPI_API_TOKEN. Product catalogue only.",
    };
  }

  if (id.includes("esankhyiki")) {
    return { source, datasets: PUBLIC_CATALOGUE.esankhyiki };
  }

  if (id.includes("unitdata") || id.includes("microdata")) {
    try {
      const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";
      const res = await fetch(`${BACKEND_URL}/api/microdata/datasets?page=1`, {
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      const body = await res.json();
      return { source, live: true, payload: body };
    } catch (error) {
      return {
        source,
        live: false,
        error: error instanceof Error ? error.message : "Official MoSPI data is currently unavailable.",
      };
    }
  }

  if (id.includes("nssta")) {
    try {
      const programmes = await getNSSTAProvider().listProgrammes();
      return {
        source,
        ingestMode: "html-ingest",
        programmes: programmes.map((item) => ({
          ...item,
          source: "nssta",
          source_url: item.sourceUrl,
        })),
      };
    } catch (error) {
      return {
        source,
        ingestMode: "html-ingest",
        programmes: [],
        warning: error instanceof Error ? error.message : "NSSTA ingest failed",
      };
    }
  }

  if (id.includes("igot") || id.includes("karmayogi")) {
    const provider = getIGOTProvider();
    const batches = await provider.listBatches({ limit: 100 });
    const providerStatus = provider.status();

    // Group batches by courseId for a clean response shape
    const batchesByCourse = batches.reduce<Record<string, typeof batches>>((acc, batch) => {
      if (!acc[batch.courseId]) acc[batch.courseId] = [];
      acc[batch.courseId].push(batch);
      return acc;
    }, {});

    return {
      source,
      /**
       * Honest provenance label — do NOT change to "LIVE API" or "Synced Cache".
       * This is mock data shaped to the real Sunbird API contract.
       */
      dataProvenance: providerStatus,
      providerMode: process.env.IGOT_PROVIDER ?? "mock",
      batchCount: batches.length,
      courseCount: Object.keys(batchesByCourse).length,
      batches: batches.map((batch) => ({
        batchId: batch.batchId,
        courseId: batch.courseId,
        name: batch.name,
        enrollmentType: batch.enrollmentType,
        startDate: batch.startDate,
        endDate: batch.endDate,
        status: batch.status,
        dataProvenance: batch.dataProvenance,
      })),
      note: providerStatus,
    };
  }

  if (id.includes("data-gov") || id.includes("datagov")) {
    return { source, datasets: PUBLIC_CATALOGUE.datagovin };
  }

  return { source };
}
