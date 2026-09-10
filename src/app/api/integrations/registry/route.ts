import { NextResponse } from "next/server";
import { getIntegrationOverview } from "@/lib/integrations/catalog";

export async function GET() {
  const payload = await getIntegrationOverview();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=600",
    },
  });
}
