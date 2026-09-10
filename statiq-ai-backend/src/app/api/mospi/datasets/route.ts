import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { mcpListDatasets } from "@/lib/integrations/mospi-mcp/client";
import { mcpCache, TTL } from "@/lib/integrations/mospi-mcp/cache";

export async function GET(req: NextRequest) {
  const user = await getSession(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let datasetList = mcpCache.get("datasets");
    if (!datasetList) {
      datasetList = await mcpListDatasets();
      mcpCache.set("datasets", datasetList, TTL.DATASETS);
    }
    return NextResponse.json(datasetList);
  } catch (error: any) {
    console.error("Datasets Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
