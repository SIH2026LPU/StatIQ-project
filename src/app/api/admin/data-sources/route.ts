import { NextResponse } from "next/server";
import { listSourceHealth } from "@/lib/sync";
import { ensureOfficialData } from "@/lib/sync/ensure";

export async function GET() {
  await ensureOfficialData().catch(() => undefined);
  return NextResponse.json({ success: true, data: listSourceHealth() });
}
