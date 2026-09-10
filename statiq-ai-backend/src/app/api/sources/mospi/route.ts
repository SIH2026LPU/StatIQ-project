import { NextResponse } from 'next/server';
import { fetchWpiRecords } from '@/lib/integrations/mospi/mospiService';
import { getMospiAuthStatus } from '@/lib/integrations/mospi/mospiAuthService';

export async function GET() {
  const start = Date.now();
  try {
    // Doing a real probe by fetching WPI records
    const res = await fetchWpiRecords({ year: 2024, month: 1 });
    const latencyMs = Date.now() - start;
    const authStatus = getMospiAuthStatus();

    // Configure CORS headers to allow frontend access
    const headers = {
      'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (res.statusCode === 200 && res.data) {
      return NextResponse.json({
        source: "mospi",
        name: "MoSPI API Platform",
        status: "live",
        reachable: true,
        authenticated: true,
        latencyMs,
        sourceOfTruth: "official",
        fallback: false,
        message: "Official MoSPI API responding"
      }, { status: 200, headers });
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      return NextResponse.json({
        source: "mospi",
        name: "MoSPI API Platform",
        status: "authentication_error",
        reachable: true,
        authenticated: false,
        latencyMs,
        sourceOfTruth: "official",
        fallback: false,
        message: "Backend could not authenticate with MoSPI"
      }, { status: 200, headers }); // Sending 200 so frontend doesn't throw a network error, just reads the status field
    } else {
      return NextResponse.json({
        source: "mospi",
        name: "MoSPI API Platform",
        status: "mospi_unreachable",
        reachable: false,
        authenticated: authStatus.authenticated,
        latencyMs,
        sourceOfTruth: "official",
        fallback: false,
        message: "Official API could not be reached"
      }, { status: 200, headers });
    }
  } catch (error: any) {
    return NextResponse.json({
      source: "mospi",
      name: "MoSPI API Platform",
      status: "mospi_unreachable",
      reachable: false,
      authenticated: false,
      latencyMs: Date.now() - start,
      sourceOfTruth: "official",
      fallback: false,
      message: error.message
    }, { status: 200, headers: {
      'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:3000'
    } });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
