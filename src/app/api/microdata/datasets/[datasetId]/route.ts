import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  const { datasetId } = await params;
  const targetUrl = new URL(`/api/microdata/datasets/${encodeURIComponent(datasetId)}`, BACKEND_URL);

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
          ? "MoSPI dataset detail request timed out."
          : (error.message || "Failed to communicate with StatIQ backend proxy."),
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
