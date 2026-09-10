import { NextRequest } from "next/server";
import { unitDataClient } from "@/lib/integrations/mospi/unitdataClient";
import { unitDataHttp, logUnitData } from "@/lib/integrations/mospi/unitdataHttp";
import { cacheDatasets, logAccess } from "@/lib/integrations/mospi/unitdataCache";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> },
) {
  const started = Date.now();
  const { datasetId } = await params;
  const result = await unitDataClient.getDataset(datasetId);
  const session = await getSession(req);
  if (result.ok && result.dataset) {
    cacheDatasets([result.dataset]).catch(() => undefined);
  }
  logAccess({
    userId: session?.userId,
    role: session?.role,
    action: "view_dataset",
    datasetId,
    status: result.ok ? "ok" : result.mode,
    category: result.ok ? undefined : result.category,
  }).catch(() => undefined);
  const response = unitDataHttp(result);
  logUnitData({
    endpoint: "GET /api/microdata/datasets/:id",
    datasetId,
    durationMs: Date.now() - started,
    status: response.status,
    category: result.ok ? "LIVE" : result.category,
  });
  return response;
}
