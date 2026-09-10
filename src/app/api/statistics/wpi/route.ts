import { NextResponse } from "next/server";
import { getMOSPIProvider } from "@/lib/integrations/mospi";
import { officialRepo } from "@/db/official-store";
import { ensureOfficialData } from "@/lib/sync/ensure";

export async function GET(request: Request) {
  await ensureOfficialData().catch(() => undefined);
  const { searchParams } = new URL(request.url);
  const live = await getMOSPIProvider().getWPIRecords({
    year: searchParams.get("year") || undefined,
    month: searchParams.get("month") || undefined,
    majorGroup: searchParams.get("major_group") || undefined,
    group: searchParams.get("group") || undefined,
    subgroup: searchParams.get("subgroup") || undefined,
    item: searchParams.get("item") || undefined,
    format: searchParams.get("format") || undefined,
  });
  const cached = officialRepo.allRecords("ds-wpi");
  return NextResponse.json({
    success: true,
    data: {
      live,
      cachedCount: cached.length,
      warning: live.warning,
      lastSynchronized: officialRepo.getDataset("ds-wpi")?.lastUpdated,
    },
  });
}
