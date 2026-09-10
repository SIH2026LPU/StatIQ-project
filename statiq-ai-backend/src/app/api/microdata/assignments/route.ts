import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { unitdataAssignments } from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { desc } from "drizzle-orm";
import { logAccess } from "@/lib/integrations/mospi/unitdataCache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["TRAINER", "CONTENT_MANAGER", "ORG_ADMIN", "SUPER_ADMIN", "LEARNER"]);
  if (!auth.ok) return auth.response;
  const rows = await getDb()
    .select()
    .from(unitdataAssignments)
    .orderBy(desc(unitdataAssignments.createdAt))
    .limit(100);
  return NextResponse.json({ assignments: rows, source: "MoSPI Microdata Portal" });
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["TRAINER", "CONTENT_MANAGER", "ORG_ADMIN", "SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const body = (await req.json()) as {
    sourceDatasetId?: string;
    learnerUserId?: string;
    title?: string;
    tasks?: string[];
  };
  if (!body.sourceDatasetId) {
    return NextResponse.json(
      { error: "sourceDatasetId is required", category: "INVALID_REQUEST" },
      { status: 400 },
    );
  }
  const [row] = await getDb()
    .insert(unitdataAssignments)
    .values({
      trainerUserId: auth.user.userId,
      learnerUserId: body.learnerUserId ?? null,
      sourceDatasetId: body.sourceDatasetId,
      title: body.title ?? null,
      tasks: body.tasks ?? [],
    })
    .returning();
  await logAccess({
    userId: auth.user.userId,
    role: auth.user.role,
    action: "assign_dataset",
    datasetId: body.sourceDatasetId,
    status: "ok",
  });
  return NextResponse.json({ assignment: row });
}
