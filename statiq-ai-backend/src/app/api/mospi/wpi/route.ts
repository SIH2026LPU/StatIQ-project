import { NextRequest, NextResponse } from "next/server";
import { fetchMospiAPI } from "@/lib/integrations/mospi/mospiService";

function httpStatusForUpstream(code: number) {
  if (code === 401 || code === 403) return code;
  if (code === 429) return 429;
  if (code === 504) return 504;
  if (code >= 500) return 502;
  if (code >= 400) return code;
  return 502;
}

function errorCode(code: number) {
  if (code === 401 || code === 403) return "MOSPI_AUTH_ERROR";
  if (code === 429) return "MOSPI_RATE_LIMITED";
  if (code === 504) return "MOSPI_UPSTREAM_TIMEOUT";
  return "MOSPI_UPSTREAM_ERROR";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // MoSPI WPI API requires "Format" (capital F) and "limit" (not "recordPerPage")
    // Normalise any lowercase "format" from the frontend before forwarding upstream
    if (!params.Format && !params.format) {
      params.Format = "JSON";
    } else if (params.format && !params.Format) {
      params.Format = params.format.toUpperCase();
      delete params.format;
    }
    if (!params.page) params.page = "1";
    // Accept both "limit" and "recordPerPage" from callers; MoSPI only accepts "limit"
    if (!params.limit && params.recordPerPage) {
      params.limit = params.recordPerPage;
      delete params.recordPerPage;
    } else if (!params.limit) {
      params.limit = "20";
    }
    // Normalise filter param names: "month" → "month_code", "majorgroup"/"majorGroup" → "major_group_code"
    if (params.month && !params.month_code) { params.month_code = params.month; delete params.month; }
    if (params.majorgroup && !params.major_group_code) { params.major_group_code = params.majorgroup; delete params.majorgroup; }
    if (params.majorGroup && !params.major_group_code) { params.major_group_code = params.majorGroup; delete params.majorGroup; }
    if (params.group && !params.group_code) { params.group_code = params.group; delete params.group; }
    if (params.subgroup && !params.sub_group_code) { params.sub_group_code = params.subgroup; delete params.subgroup; }
    if (params.item && !params.item_code) { params.item_code = params.item; delete params.item; }

    const res = await fetchMospiAPI("/api/wpi/getWpiRecords", params);

    if (res.statusCode >= 400 || !res.data) {
      const status = httpStatusForUpstream(res.statusCode || 502);
      return NextResponse.json(
        {
          success: false,
          error: errorCode(res.statusCode || 502),
          dataset: "WPI",
          message: res.error || "MoSPI WPI request failed",
          statusCode: res.statusCode,
        },
        { status },
      );
    }

    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "MOSPI_UPSTREAM_ERROR",
        dataset: "WPI",
        message: error.message,
      },
      { status: 502 },
    );
  }
}
