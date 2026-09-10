import { NextResponse } from "next/server";
import { officialRepo } from "@/db/official-store";
import { ensureOfficialData } from "@/lib/sync/ensure";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await ensureOfficialData().catch(() => undefined);
  const { id } = await context.params;
  const dataset = officialRepo.getDataset(id);
  if (!dataset) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Dataset not found" } },
      { status: 404 },
    );
  }
  const page = officialRepo.listRecords(id, 0, 50);
  return NextResponse.json({ success: true, data: { dataset, records: page } });
}
