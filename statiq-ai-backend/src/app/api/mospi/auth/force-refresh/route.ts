import { NextRequest, NextResponse } from 'next/server';
import { invalidateMospiToken, getValidMospiToken, getMospiAuthStatus } from '@/lib/integrations/mospi/mospiAuthService';

export async function POST(req: NextRequest) {
  try {
    invalidateMospiToken();
    await getValidMospiToken();
    const status = getMospiAuthStatus();
    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      status
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: {
        type: "MOSPI_AUTHENTICATION_FAILED",
        message: error.message || "MoSPI authentication failed"
      }
    }, { status: 502 });
  }
}
