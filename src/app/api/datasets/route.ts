import { NextResponse } from "next/server";
import { officialRepo } from "@/db/official-store";
import { ensureOfficialData } from "@/lib/sync/ensure";

export async function GET(request: Request) {
  await ensureOfficialData().catch(() => undefined);
  const { searchParams } = new URL(request.url);
  const rows = officialRepo.listDatasets({
    q: searchParams.get("q") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    theme: searchParams.get("theme") ?? undefined,
  });
  return NextResponse.json({ success: true, data: rows });
}
