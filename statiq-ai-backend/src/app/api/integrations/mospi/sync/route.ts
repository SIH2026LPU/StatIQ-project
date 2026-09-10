import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { syncEsankhyikiCatalogue, syncDatasetRecords } from "@/lib/integrations/mospi-mcp/sync";

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["SUPER_ADMIN", "ORG_ADMIN"]);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action; // 'catalogue' or 'records'
    const dataset = body.dataset;
    const filters = body.filters || {};

    if (action === "catalogue") {
      const result = await syncEsankhyikiCatalogue();
      return NextResponse.json(result);
    } else if (action === "records") {
      if (!dataset) {
        return NextResponse.json({ error: "Dataset code is required for records sync." }, { status: 400 });
      }
      const result = await syncDatasetRecords(dataset, filters);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'catalogue' or 'records'." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync" }, { status: 500 });
  }
}
