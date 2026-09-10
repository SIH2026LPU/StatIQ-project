import { NextResponse } from "next/server";
import { officialRepo } from "@/db/official-store";
import { ensureOfficialData } from "@/lib/sync/ensure";

export async function GET() {
  await ensureOfficialData().catch(() => undefined);
  return NextResponse.json({
    success: true,
    data: {
      datasets: officialRepo.listDatasets(),
      wpi: officialRepo.getDataset("ds-wpi"),
    },
  });
}
