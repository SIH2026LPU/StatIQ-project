import { NextResponse } from "next/server";
import { db } from "@/db/store";
import { officialRepo } from "@/db/official-store";
import { ensureOfficialData } from "@/lib/sync/ensure";

export async function GET() {
  await ensureOfficialData().catch(() => undefined);
  return NextResponse.json({
    success: true,
    data: {
      demo: db.listProgrammes(),
      ingested: officialRepo.listDatasets({ theme: "Training" }),
      ingestMode: "html-ingest",
    },
  });
}
