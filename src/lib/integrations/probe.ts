export type ProbeMode =
  | "live"
  | "cached-catalogue"
  | "unreachable"
  | "authentication_error"
  | "degraded"
  | "backend_unreachable"
  | (string & {});

export interface ProbeResult {
  ok: boolean;
  status?: number;
  latencyMs: number;
  mode: ProbeMode;
  message: string;
}

const probeHeaders = {
  Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
  "User-Agent": "StatIQ-AI/0.1 (SIH 26101; official-statistics competency platform)",
};

export async function probeUrl(url: string, timeoutMs = 4000): Promise<ProbeResult> {
  const started = Date.now();
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: probeHeaders,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: probeHeaders,
        signal: AbortSignal.timeout(timeoutMs),
      });
    }
    const latencyMs = Date.now() - started;
    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        latencyMs,
        mode: "live",
        message: "Official origin responded.",
      };
    }
    return {
      ok: false,
      status: response.status,
      latencyMs,
      mode: "cached-catalogue",
      message: `Origin returned HTTP ${response.status}. Showing verified catalogue metadata, not invented statistics.`,
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      mode: "unreachable",
      message:
        error instanceof Error
          ? `Live fetch failed (${error.message}). Catalogue fallback in use.`
          : "Live fetch failed. Catalogue fallback in use.",
    };
  }
}

export const PUBLIC_CATALOGUE = {
  mospiProducts: [
    {
      code: "WPI",
      title: "Wholesale Price Index records",
      endpoint: "/api/wpi/getWpiRecords",
      sourceUrl: "https://api.mospi.gov.in/",
      note: "Requires MoSPI API account/token. No anonymous production numbers are fabricated.",
    },
    {
      code: "CPI",
      title: "Consumer Price Index products",
      endpoint: "https://www.mospi.gov.in/",
      sourceUrl: "https://www.mospi.gov.in/",
      note: "Official releases remain on MoSPI. Use the API platform when credentials exist.",
    },
    {
      code: "IIP",
      title: "Index of Industrial Production",
      endpoint: "https://www.mospi.gov.in/",
      sourceUrl: "https://www.mospi.gov.in/",
      note: "Machine-readable access is via authorized MoSPI API products.",
    },
  ],
  esankhyiki: [
    {
      title: "Official statistics catalogue (eSankhyiki)",
      category: "Macro indicators and dataset discovery",
      sourceUrl: "https://esankhyiki.mospi.gov.in/",
      apiAvailable: true,
    },
    {
      title: "National Accounts and prices discovery",
      category: "Macroeconomic statistics",
      sourceUrl: "https://esankhyiki.mospi.gov.in/",
      apiAvailable: true,
    },
  ],
  unitdata: [
    {
      title: "Periodic Labour Force Survey (PLFS)",
      sourceUrl: "https://microdata.gov.in/",
      topic: "Employment and labour",
    },
    {
      title: "National Sample Survey (NSS) rounds",
      sourceUrl: "https://microdata.gov.in/",
      topic: "Household and social statistics",
    },
    {
      title: "Annual Survey of Industries (ASI)",
      sourceUrl: "https://microdata.gov.in/",
      topic: "Industrial statistics",
    },
  ],
  datagovin: [
    {
      title: "MoSPI open datasets on data.gov.in",
      sourceUrl: "https://www.data.gov.in/",
      note: "Resource APIs may require a data.gov.in API key. Catalogue entries are listed without inventing values.",
    },
  ],
};
