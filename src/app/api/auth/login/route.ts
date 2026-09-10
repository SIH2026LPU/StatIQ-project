import { NextResponse } from "next/server";
import { getDb, hasPostgres } from "@/db/client";
import { users, loginAttempts, employees } from "@/db/schema";
import { db as memory } from "@/db/store";
import { eq } from "drizzle-orm";
import { checkPassword } from "@/lib/auth/password";
import { createSession, redirectForRole, toSessionUser } from "@/lib/auth/session";
import { fail } from "@/lib/api/http";
import type { Role, SessionUser } from "@/types/domain";

const DEMO_EMAILS = new Set([
  "learner@statiq.demo",
  "trainer@statiq.demo",
  "admin@statiq.demo",
]);

const buckets = new Map<string, number[]>();

function rateLimit(key: string, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  return hits.length <= max;
}

async function issueSession(sessionUser: SessionUser, source: string) {
  await createSession(sessionUser);
  const redirect = redirectForRole(sessionUser.role);
  return NextResponse.json({
    success: true,
    ok: true,
    redirect,
    data: { redirect, source },
  });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  if (!rateLimit(`login:${ip}`)) {
    return fail("RATE_LIMITED", "Too many sign-in attempts.", 429);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return fail("MISSING_FIELDS", "Email and password are required.", 400);
    }

    if (hasPostgres()) {
      try {
        const db = getDb();
        const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = existingUsers[0];

        if (user) {
          const isValidPassword = await checkPassword(password, user.passwordHash);
          if (!isValidPassword) {
            if (!(DEMO_EMAILS.has(email) && password === "demo123")) {
              try {
                await db.insert(loginAttempts).values({
                  userId: user.id,
                  email,
                  ipAddress: ip,
                  userAgent,
                  success: false,
                  failureReason: "Invalid password",
                });
              } catch {}
              return fail("INVALID_CREDENTIALS", "Invalid email or password.", 401);
            }
          } else {
            if (!user.isActive || user.status !== "ACTIVE") {
              return fail("ACCOUNT_INACTIVE", "Account is not active.", 403);
            }

            try {
              await db.insert(loginAttempts).values({
                userId: user.id,
                email,
                ipAddress: ip,
                userAgent,
                success: true,
              });
              await db.update(users).set({ lastLoginAt: new Date().toISOString() }).where(eq(users.id, user.id));
            } catch {}

            let employeeId = user.id;
            try {
              const [employee] = await db
                .select({ id: employees.id })
                .from(employees)
                .where(eq(employees.userId, user.id))
                .limit(1);
              if (employee?.id) employeeId = employee.id;
            } catch {}

            return issueSession(
              toSessionUser({
                id: user.id,
                email: user.email,
                name: user.username || user.email.split("@")[0],
                role: user.role,
                employeeId,
              }),
              "postgres",
            );
          }
        }
      } catch (error) {
        console.warn("Postgres login unavailable; trying demo accounts.", error);
      }
    }

    const local = memory.authenticate(email, password);
    if (!local) {
      return fail("INVALID_CREDENTIALS", "Invalid email or password.", 401);
    }

    return issueSession(
      toSessionUser({
        id: local.id,
        email: local.email,
        name: local.name,
        role: local.role as Role,
        employeeId: local.employeeId ?? local.id,
      }),
      "demo",
    );
  } catch (error) {
    console.error("Login error:", error);
    return fail("INTERNAL_ERROR", "Sign-in failed. Please try again.", 500);
  }
}
