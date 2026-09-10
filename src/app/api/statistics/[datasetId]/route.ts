import { NextResponse } from "next/server";
import { officialRepo } from "@/db/official-store";
import { ensureOfficialData } from "@/lib/sync/ensure";

export async function GET(
  request: Request,
  context: { params: Promise<{ datasetId: string }> },
) {
  await ensureOfficialData().catch(() => undefined);
  const { datasetId } = await context.params;
  const dataset = officialRepo.getDataset(datasetId);
  if (!dataset) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Dataset not found" } },
      { status: 404 },
    );
  }
  const { searchParams } = new URL(request.url);
  const offset = Number(searchParams.get("offset") ?? 0);
  const limit = Number(searchParams.get("limit") ?? 50);
  return NextResponse.json({
    success: true,
    data: {
      dataset,
      ...officialRepo.listRecords(datasetId, offset, limit),
    },
  });
}
