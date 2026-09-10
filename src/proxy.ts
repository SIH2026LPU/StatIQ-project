import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

function isPublicApi(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/integrations")) return true;
  if (pathname.startsWith("/api/sources")) return true;
  if (pathname.startsWith("/api/lab")) return true;
  if (pathname.startsWith("/api/datasets") || pathname.startsWith("/api/statistics")) return true;
  if (pathname.startsWith("/api/training-programmes") || pathname.startsWith("/api/competencies")) return true;
  if (pathname === "/api/admin/data-sources" && request.method === "GET") return true;
  if (pathname.startsWith("/api/ai") && request.method === "POST") return true;
  if (pathname.startsWith("/api/courses") && request.method === "GET") return true;
  if (pathname.startsWith("/api/microdata") || pathname.startsWith("/api/mospi")) return true;
  if (pathname.startsWith("/api/v1")) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicApi(request)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && !["ORG_ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    return NextResponse.redirect(new URL("/learner", request.url));
  }
  if (
    pathname.startsWith("/trainer") &&
    !["TRAINER", "CONTENT_MANAGER", "ORG_ADMIN", "SUPER_ADMIN"].includes(session.role)
  ) {
    return NextResponse.redirect(new URL("/learner", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/learner",
    "/learner/:path*",
    "/trainer",
    "/trainer/:path*",
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/api/:path*",
  ],
};
