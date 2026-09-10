import { ok } from "@/lib/api/http";
import { assertRole } from "@/lib/auth/rbac";
import { workforceSnapshot } from "@/lib/services/intelligence";

export async function GET() {
  const gate = await assertRole(["ORG_ADMIN", "SUPER_ADMIN"]);
  if (gate.error) return gate.error;
  const snap = workforceSnapshot();
  return ok({
    ...snap,
    snapshots: undefined,
    synthetic: true,
    note: "Aggregates from persisted application store / seed. Not official MoSPI personnel.",
  });
}
