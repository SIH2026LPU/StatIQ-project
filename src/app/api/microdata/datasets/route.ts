import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? req.nextUrl.searchParams.get("query") ?? "";
  const page = req.nextUrl.searchParams.get("page") ?? "1";

  const targetUrl = new URL("/api/microdata/datasets", BACKEND_URL);
  if (q) targetUrl.searchParams.set("q", q);
  targetUrl.searchParams.set("page", page);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "StatIQ-Frontend-Proxy/1.0",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    const data = await res.json().catch(() => null);
    if (!data) {
      return NextResponse.json(
        {
          source: "MoSPI Microdata Portal",
          mode: "ERROR",
          error: `Backend returned non-JSON response (HTTP ${res.status})`,
          category: "SOURCE_ERROR",
        },
        { status: res.status >= 400 ? res.status : 502 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    const isTimeout = error.name === "AbortError";
    return NextResponse.json(
      {
        source: "MoSPI Microdata Portal",
        mode: "ERROR",
        error: isTimeout
          ? "MoSPI UnitData request timed out."
          : (error.message || "Failed to communicate with StatIQ backend proxy."),
        category: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
