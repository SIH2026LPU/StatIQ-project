import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb, hasPostgres } from "@/db/client";
import { users, userProfiles, employees, organizations } from "@/db/schema";
import { db as memory } from "@/db/store";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { hashPassword } from "@/lib/auth/password";
import { createSession, redirectForRole, toSessionUser } from "@/lib/auth/session";
import { fail } from "@/lib/api/http";
import type { Role } from "@/types/domain";

function mapRole(role: string): Role {
  if (role === "trainer") return "TRAINER";
  if (role === "admin") return "ORG_ADMIN";
  return "LEARNER";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, role, password } = body as {
      name?: string;
      email?: string;
      role?: string;
      password?: string;
    };

    if (!name || !email || !password || !role) {
      return fail("MISSING_FIELDS", "Please fill all required fields.", 400);
    }

    if (password.length < 6) {
      return fail("WEAK_PASSWORD", "Password must be at least 6 characters.", 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const userRole = mapRole(String(role));

    if (hasPostgres()) {
      try {
        const db = getDb();
        const existingUsers = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
        if (existingUsers.length > 0) {
          return fail("EMAIL_EXISTS", "This email is already registered.", 400);
        }

        const passwordHash = await hash(password, 10);
        const splitName = String(name).trim().split(" ");
        const firstName = splitName[0];
        const lastName = splitName.slice(1).join(" ");
        const username = normalizedEmail.split("@")[0];

        let orgId: string | null = null;
        const demoOrg = await db.select().from(organizations).where(eq(organizations.code, "DEMO_ORG")).limit(1);
        if (demoOrg[0]) {
          orgId = demoOrg[0].id;
        }

        const insertedUser = await db.insert(users).values({
          email: normalizedEmail,
          passwordHash,
          role: userRole,
          organizationId: orgId,
          username,
          status: "ACTIVE",
          emailVerified: true,
        }).returning({ id: users.id });

        const userId = insertedUser[0].id;

        await db.insert(userProfiles).values({
          userId,
          firstName,
          lastName,
        });

        if (orgId) {
          await db.insert(employees).values({
            userId,
            organizationId: orgId,
            fullName: String(name).trim(),
            designation: userRole === "LEARNER" ? "Officer" : userRole === "TRAINER" ? "Faculty" : "Administrator",
            careerGoal: "Continuous learning and professional development.",
            preferredLanguage: "en",
            isSynthetic: false,
          });
        }

        const sessionUser = toSessionUser({
          id: userId,
          email: normalizedEmail,
          name: String(name).trim(),
          role: userRole,
          employeeId: userId,
        });

        await createSession(sessionUser);
        const redirect = redirectForRole(userRole);
        return NextResponse.json({
          success: true,
          ok: true,
          redirect,
          data: { redirect, source: "postgres" },
        });
      } catch (error) {
        console.warn("Postgres registration unavailable; using local demo store.", error);
      }
    }

    if (memory.findUserByEmail(normalizedEmail)) {
      return fail("EMAIL_EXISTS", "This email is already registered.", 400);
    }

    const userId = `u-${randomUUID()}`;
    const employeeId = `emp-${randomUUID()}`;
    memory.addUser({
      id: userId,
      email: normalizedEmail,
      password: hashPassword(password),
      role: userRole,
      employeeId,
      name: String(name).trim(),
    });

    await createSession(
      toSessionUser({
        id: userId,
        email: normalizedEmail,
        name: String(name).trim(),
        role: userRole,
        employeeId,
      }),
    );

    const redirect = redirectForRole(userRole);
    return NextResponse.json({
      success: true,
      ok: true,
      redirect,
      data: { redirect, source: "demo" },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return fail("INTERNAL_ERROR", "An error occurred during registration.", 500);
  }
}
