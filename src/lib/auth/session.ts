import { cookies } from "next/headers";
import { getDb, hasPostgres } from "@/db/client";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SESSION_COOKIE, signSession, verifySessionToken } from "@/lib/auth/token";
import type { Role, SessionUser } from "@/types/domain";

export async function createSession(user: SessionUser) {
  const token = await signSession(user);
  const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000); // 7 days

  if (hasPostgres()) {
    try {
      const db = getDb();
      await db.insert(sessions).values({
        userId: user.id,
        token,
        expiresAt: expiresAt.toISOString(),
        ipAddress: "unknown",
        userAgent: "unknown",
      });
    } catch (error) {
      console.warn("Could not persist session row; cookie session will still be issued.", error);
    }
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (token && hasPostgres()) {
    try {
      const db = getDb();
      await db.delete(sessions).where(eq(sessions.token, token));
    } catch (error) {
      console.warn("Could not delete session row.", error);
    }
  }

  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sessionUser = await verifySessionToken(token);
  if (!sessionUser) return null;

  if (hasPostgres()) {
    try {
      const db = getDb();
      const dbSessions = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
      const session = dbSessions[0];

      if (session) {
        if (new Date(session.expiresAt) < new Date()) {
          return null;
        }
        await db.update(sessions)
          .set({ lastUsedAt: new Date().toISOString() })
          .where(eq(sessions.id, session.id));
      }
    } catch (error) {
      console.warn("Session lookup skipped; trusting signed cookie.", error);
    }
  }

  return sessionUser;
}

export function toSessionUser(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
  employeeId?: string;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    employeeId: user.employeeId,
  };
}

export function redirectForRole(role: Role) {
  if (role === "ORG_ADMIN" || role === "SUPER_ADMIN") return "/admin";
  if (role === "TRAINER" || role === "CONTENT_MANAGER") return "/trainer";
  return "/learner";
}

export function canAccess(role: Role, area: "learner" | "trainer" | "admin") {
  if (area === "admin") return role === "ORG_ADMIN" || role === "SUPER_ADMIN";
  if (area === "trainer")
    return (
      role === "TRAINER" ||
      role === "CONTENT_MANAGER" ||
      role === "ORG_ADMIN" ||
      role === "SUPER_ADMIN"
    );
  return true;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) return null;

  if (hasPostgres()) {
    try {
      const db = getDb();
      const dbUsers = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
      const user = dbUsers[0];
      if (user) {
        if (!user.isActive) return null;
        return toSessionUser({
          id: user.id,
          email: user.email,
          name: user.username || user.email.split("@")[0],
          role: user.role,
          employeeId: session.employeeId ?? user.id,
        });
      }
    } catch (error) {
      console.warn("User lookup skipped; using cookie session.", error);
    }
  }

  return session;
}
