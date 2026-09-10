import { NextResponse } from "next/server";
import { assertRole } from "@/lib/auth/rbac";
import { syncAll, syncHtmlCatalogue, syncIgot, syncMospi, syncUnitdata } from "@/lib/sync";

export async function POST(
  _request: Request,
  context: { params: Promise<{ source: string }> },
) {
  const gate = await assertRole(["ORG_ADMIN", "SUPER_ADMIN"]);
  if (gate.error) return gate.error;
  const { source } = await context.params;
  if (source === "all") {
    return NextResponse.json({ success: true, data: await syncAll() });
  }
  if (source === "WPI") {
    const { backendJson } = await import("@/lib/backend");
    const result = await backendJson("/api/data/sync/WPI", { method: "POST" });
    return NextResponse.json(result);
  }
  if (source === "mospi" || source === "mospi-api") {
    return NextResponse.json({ success: true, data: await syncMospi() });
  }
  if (source === "esankhyiki") {
    return NextResponse.json({
      success: true,
      data: await syncHtmlCatalogue("esankhyiki", "Official statistics catalogue", "Macro"),
    });
  }
  if (source === "nssta") {
    return NextResponse.json({
      success: true,
      data: await syncHtmlCatalogue("nssta", "Training programmes", "Training"),
    });
  }
  if (source === "unitdata") {
    return NextResponse.json({ success: true, data: await syncUnitdata() });
  }
  if (source === "igot") {
    return NextResponse.json({ success: true, data: await syncIgot() });
  }
  return NextResponse.json(
    { success: false, error: { code: "UNKNOWN_SOURCE", message: "Unknown source" } },
    { status: 404 },
  );
}
