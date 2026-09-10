import type { MOSPIResult, WPIFilters } from "./types";

const AWAITING = "Awaiting backend connection. No WPI numbers were invented.";

export async function getWPIRecords(
  filters: WPIFilters = {},
): Promise<MOSPIResult<Record<string, unknown>>> {
  const retrievedAt = new Date().toISOString();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://127.0.0.1:4000";
  const officialUrl = "https://api.mospi.gov.in";
  
  const url = new URL("/api/mospi/wpi", BACKEND_URL);
  
  // MoSPI WPI API requires "Format" (capital F), "month_code" (not "month"),
  // "major_group_code" (not "majorGroup"). The backend WPI route also normalises
  // these, but send the correct names here so the URL is clean and unambiguous.
  const map: Record<string, string | undefined> = {
    year: filters.year?.toString(),
    month_code: filters.month?.toString(),
    major_group_code: filters.majorGroup,
    group_code: filters.group,
    sub_group_code: filters.subgroup,
    item_code: filters.item,
    // "Format" (capital) is required; will be set below if not provided by caller
  };
  
  for (const [key, value] of Object.entries(map)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  }
  // Always set Format (required by MoSPI); normalise any "format" the caller added
  if (!url.searchParams.has("Format")) {
    const fmt = filters.format ?? url.searchParams.get("format");
    url.searchParams.set("Format", fmt ? fmt.toUpperCase() : "JSON");
    url.searchParams.delete("format");
  }

  console.log("[WPI] requesting backend");
  console.log("[WPI] URL:", url.toString());

  try {
    const response = await fetch(url, {
      cache: "no-store",
      // 70 s — must outlast MOSPI_REQUEST_TIMEOUT_MS (60 s) on the backend so the
      // backend's structured 504 arrives before this AbortSignal fires and produces
      // a generic "aborted" error that's harder to diagnose.
      signal: AbortSignal.timeout(70_000),
    });

    console.log("[WPI] status:", response.status);

    if (!response.ok) {
      const body = await response.json().catch(() => ({} as { error?: string; message?: string }));
      return {
        live: false,
        records: [],
        source: "MoSPI API Platform (via StatIQ Backend)",
        retrievedAt,
        warning: body.error || body.message || `WPI request failed (HTTP ${response.status}).`,
        officialUrl,
      };
    }

    const body = (await response.json()) as any;
    
    // Check if the backend proxy returned a structured error
    if (body && typeof body === 'object' && 'statusCode' in body && body.statusCode >= 400) {
      console.log("[WPI] backend returned error structure:", body.error);
      return {
        live: false,
        records: [],
        source: "MoSPI API Platform (via StatIQ Backend)",
        retrievedAt,
        warning: `Backend MoSPI Error: ${body.error || 'Unknown error'}`,
        officialUrl,
      };
    }

    const records = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.records)
          ? body.records
          : [];
        
    console.log("[WPI] record count:", records.length);
        
    return {
      live: true,
      records: records as Record<string, unknown>[],
      source: "MoSPI API Platform (via StatIQ Backend)",
      retrievedAt,
      officialUrl,
    };
  } catch (e: any) {
    console.log("[WPI] fetch failed:", e.message);
    return {
      live: false,
      records: [],
      source: "MoSPI API Platform (via StatIQ Backend)",
      retrievedAt,
      warning: `Unable to fetch live WPI data. (Fetch failed: ${e.message})`,
      officialUrl,
    };
  }
}
