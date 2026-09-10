import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getDb } from "@/db";
import { sessions, users, employees } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface SessionUser {
  userId: string;
  id: string;
  email?: string;
  name?: string;
  employeeId?: string;
  organizationId?: string;
  role: "SUPER_ADMIN" | "ORG_ADMIN" | "TRAINER" | "LEARNER" | "CONTENT_MANAGER";
}

const AUTH_SECRET = process.env.AUTH_SECRET ?? "dev-statiq-auth-secret-change-me";

export async function getSession(req: NextRequest): Promise<SessionUser | null> {
  const token =
    req.cookies.get("statiq_session")?.value ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) return null;

  try {
    const payload = jwt.verify(token, AUTH_SECRET) as Record<string, unknown>;
    
    // Verify against database
    const db = getDb();
    const [activeSession] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    
    if (!activeSession || new Date() > activeSession.expiresAt) {
      return null;
    }

    const id = String(payload.userId ?? payload.id ?? "");
    if (!id || !payload.role) return null;
    
    // Optionally update lastUsedAt in the background
    // db.update(sessions).set({ lastUsedAt: new Date() }).where(eq(sessions.id, activeSession.id)).execute();
    
    return {
      userId: id,
      id,
      email: payload.email ? String(payload.email) : undefined,
      name: payload.name ? String(payload.name) : undefined,
      employeeId: payload.employeeId ? String(payload.employeeId) : undefined,
      organizationId: payload.organizationId ? String(payload.organizationId) : undefined,
      role: payload.role as SessionUser["role"],
    };
  } catch {
    return null;
  }
}

type RequireRoleResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: NextResponse };

export async function requireRole(
  req: NextRequest,
  allowedRoles: SessionUser["role"][],
): Promise<RequireRoleResult> {
  const user = await getSession(req);

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden — insufficient role" }, { status: 403 }),
    };
  }

  return { ok: true, user };
}

export function signSession(
  user: {
    id: string;
    email: string;
    name: string;
    role: SessionUser["role"];
    employeeId?: string;
    organizationId?: string;
  },
  expiresIn: jwt.SignOptions["expiresIn"] = "8h",
): string {
  return jwt.sign(
    {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: user.employeeId,
      organizationId: user.organizationId,
    },
    AUTH_SECRET,
    { expiresIn },
  );
}
