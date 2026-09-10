import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb, hasDatabaseUrl } from "@/db";
import { employees, users, sessions } from "@/db/schema";
import { signSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "Backend database is not configured (DATABASE_URL)." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, user.id))
    .limit(1);

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: employee?.fullName ?? user.email,
    role: user.role,
    employeeId: employee?.id,
    organizationId: user.organizationId ?? employee?.organizationId,
  };

  const token = signSession(sessionUser);
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

  // Insert session into DB
  await db.insert(sessions).values({
    userId: user.id,
    token,
    expiresAt,
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
    userAgent: req.headers.get("user-agent") ?? null,
  });

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const redirect =
    user.role === "ORG_ADMIN" || user.role === "SUPER_ADMIN"
      ? "/admin"
      : user.role === "TRAINER" || user.role === "CONTENT_MANAGER"
        ? "/trainer"
        : "/learner";

  const response = NextResponse.json({
    success: true,
    ok: true,
    token,
    redirect,
    user: sessionUser,
    source: "postgres",
  });
  response.cookies.set("statiq_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return response;
}
