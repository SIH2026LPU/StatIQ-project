import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { mcpGetIndicators, mcpGetMetadata } from "@/lib/integrations/mospi-mcp/client";
import { mcpCache, TTL } from "@/lib/integrations/mospi-mcp/cache";

export async function GET(req: NextRequest) {
  const user = await getSession(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const dataset = searchParams.get("dataset");
    const indicatorCode = searchParams.get("indicator_code");

    if (!dataset) {
      return NextResponse.json({ error: "Missing dataset parameter" }, { status: 400 });
    }

    if (indicatorCode) {
      const metaCacheKey = `metadata:${dataset}:${indicatorCode}`;
      let metadataResult = mcpCache.get(metaCacheKey);
      if (!metadataResult) {
        metadataResult = await mcpGetMetadata(dataset, parseInt(indicatorCode));
        mcpCache.set(metaCacheKey, metadataResult, TTL.METADATA);
      }
      return NextResponse.json(metadataResult);
    } else {
      const indicatorCacheKey = `indicators:${dataset}`;
      let indicatorsResult = mcpCache.get(indicatorCacheKey);
      if (!indicatorsResult) {
        indicatorsResult = await mcpGetIndicators(dataset);
        mcpCache.set(indicatorCacheKey, indicatorsResult, TTL.INDICATORS);
      }
      return NextResponse.json(indicatorsResult);
    }
  } catch (error: any) {
    console.error("Indicators Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
