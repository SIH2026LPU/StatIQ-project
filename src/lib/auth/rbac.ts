import type { Role, SessionUser } from "@/types/domain";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api/http";

export async function requireAuth() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export function requireRole(session: SessionUser, roles: Role[]) {
  return roles.includes(session.role);
}

export function requireOrganizationAccess(
  session: SessionUser,
  organizationId: string,
) {
  if (session.role === "SUPER_ADMIN") return true;
  return organizationId === "org-mospi-demo";
}

export async function assertRole(roles: Role[]) {
  const session = await requireAuth();
  if (!session) return { session: null, error: fail("UNAUTHENTICATED", "Sign in required.", 401) };
  if (!requireRole(session, roles)) {
    return { session, error: fail("FORBIDDEN", "Insufficient role.", 403) };
  }
  return { session, error: null };
}
