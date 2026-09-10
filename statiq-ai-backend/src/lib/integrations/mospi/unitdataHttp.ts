import { NextResponse } from "next/server";
import { UNITDATA_SOURCE, type UnitDataResult } from "@/lib/integrations/mospi/unitdataClient";

const statusFor = {
  CONFIGURATION_ERROR: 503,
  AUTHENTICATION_ERROR: 401,
  AUTHORIZATION_ERROR: 403,
  NETWORK_ERROR: 502,
  TIMEOUT: 504,
  RATE_LIMITED: 429,
  SOURCE_ERROR: 502,
  INVALID_REQUEST: 400,
  NOT_FOUND: 404,
} as const;

export function unitDataHttp<T extends Record<string, unknown>>(result: UnitDataResult<T>) {
  if (result.ok) {
    const { ok: _ok, ...rest } = result;
    return NextResponse.json(rest);
  }

  const status =
    result.mode === "NOT_CONFIGURED"
      ? 503
      : result.mode === "AUTH_REQUIRED"
        ? 403
        : statusFor[result.category] ?? 502;

  return NextResponse.json(
    {
      source: result.source || UNITDATA_SOURCE,
      mode: result.mode,
      error: result.error,
      category: result.category,
      errorCategory: result.errorCategory,
      message: result.mode === "AUTH_REQUIRED" ? result.error : undefined,
    },
    { status },
  );
}

export function logUnitData(event: {
  endpoint: string;
  datasetId?: string;
  fileId?: string;
  durationMs: number;
  status: number;
  category?: string;
}) {
  console.info(
    JSON.stringify({
      source: "unitdata",
      ...event,
    }),
  );
}
