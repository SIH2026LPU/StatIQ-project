import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://127.0.0.1:4000";

export async function GET() {
  try {
    console.log(`[PROXY] Fetching from ${BACKEND_URL}/api/sources/mospi`);
    const res = await fetch(`${BACKEND_URL}/api/sources/mospi`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    const text = await res.text();
    console.log(`[PROXY] Response status: ${res.status}, body: ${text}`);
    const data = JSON.parse(text);
    return NextResponse.json(data, { status: res.status === 200 ? 200 : res.status });
  } catch (error: any) {
    return NextResponse.json({
        source: "mospi",
        name: "MoSPI API Platform",
        status: "backend_unreachable",
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        sourceOfTruth: "official",
        fallback: false,
        message: "BACKEND UNAVAILABLE: StatIQ backend could not be reached"
    }, { status: 502 });
  }
}
