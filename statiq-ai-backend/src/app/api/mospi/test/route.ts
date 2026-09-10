import { NextRequest, NextResponse } from 'next/server';
import { fetchWpiRecords } from '@/lib/integrations/mospi/mospiService';
import { getMospiAuthStatus } from '@/lib/integrations/mospi/mospiAuthService';

export async function GET(req: NextRequest) {
  try {
    const authStatus = getMospiAuthStatus();
    const res = await fetchWpiRecords({ year: 2024, month: 1 }); // Testing with a known parameter if needed

    if (res.statusCode >= 400 || !res.data) {
      return NextResponse.json({
        success: false,
        source: res.source,
        statusCode: res.statusCode,
        error: res.error,
        diagnostics: {
          baseUrlConfigured: !!process.env.MOSPI_API_BASE_URL,
          authStatus
        }
      }, { status: res.statusCode });
    }

    const records = res.data.records || res.data.data || res.data;
    const isArray = Array.isArray(records);

    return NextResponse.json({
      success: true,
      source: res.source,
      dataset: 'WPI',
      endpoint: '/api/wpi/getWpiRecords',
      statusCode: res.statusCode,
      recordCount: isArray ? records.length : 0,
      sample: isArray ? records.slice(0, 3) : [],
      tokenStatus: 'valid',
      diagnostics: {
        baseUrlConfigured: !!process.env.MOSPI_API_BASE_URL,
        authStatus
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      source: 'MoSPI API',
      statusCode: 500,
      error: error.message,
      diagnostics: {
        baseUrlConfigured: !!process.env.MOSPI_API_BASE_URL,
      }
    }, { status: 500 });
  }
}
