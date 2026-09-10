import { NextResponse } from "next/server";
import { getSourcePayload } from "@/lib/integrations/catalog";
import { getMOSPIProvider } from "@/lib/integrations/mospi";

export const revalidate = 600;

export async function GET(request: Request) {
  const payload = await getSourcePayload("mospi-api-platform");
  const { searchParams } = new URL(request.url);
  const wpi = await getMOSPIProvider().getWPIRecords({
    year: searchParams.get("year") || undefined,
    month: searchParams.get("month") || undefined,
    majorGroup: searchParams.get("major_group") || undefined,
    group: searchParams.get("group") || undefined,
    subgroup: searchParams.get("subgroup") || undefined,
    item: searchParams.get("item") || undefined,
    format: searchParams.get("format") || undefined,
  });
  return NextResponse.json({ success: true, data: { ...payload, wpi } });
}
