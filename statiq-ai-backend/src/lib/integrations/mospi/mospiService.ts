import https from 'https';
import crypto from 'crypto';
import { getValidMospiToken, invalidateMospiToken } from './mospiAuthService';

const MOSPI_BASE_URL = process.env.MOSPI_API_BASE_URL || 'https://api.mospi.gov.in';
const REQUEST_TIMEOUT_MS = parseInt(process.env.MOSPI_REQUEST_TIMEOUT_MS || '15000', 10);
const RETRYABLE = new Set([429, 500, 502, 503]);

// Pinned to TLS 1.2 with OpenSSL legacy server connect to prevent TLS 1.3 handshake hangs
// on the official MoSPI Nginx gateway (api.mospi.gov.in:443).
const httpsAgent = new https.Agent({
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.2',
  keepAlive: false,
});

export interface MospiResponse<T = any> {
  statusCode: number;
  data: T | null;
  error?: string;
  source: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function onceRequest(url: URL, token?: string): Promise<MospiResponse> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: MospiResponse) => {
      if (settled) return;
      settled = true;
      clearTimeout(hardTimer);
      resolve(value);
    };

    const hardTimer = setTimeout(() => {
      req.destroy();
      finish({
        statusCode: 504,
        data: null,
        error: "ETIMEDOUT",
        source: "MoSPI API",
      });
    }, REQUEST_TIMEOUT_MS);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };
    if (token) {
      headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 443,
      path: url.pathname + url.search,
      method: "GET" as const,
      agent: httpsAgent,
      headers,
    };

    const req = https.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        try {
          if (res.statusCode && res.statusCode >= 400) {
            finish({
              statusCode: res.statusCode,
              data: null,
              error: `HTTP ${res.statusCode}: ${responseBody.substring(0, 200)}`,
              source: "MoSPI API",
            });
            return;
          }
          let json = null;
          if (responseBody.trim().startsWith("{") || responseBody.trim().startsWith("[")) {
            json = JSON.parse(responseBody);
          }
          finish({
            statusCode: res.statusCode || 200,
            data: json,
            source: "MoSPI API",
          });
        } catch (e: any) {
          finish({
            statusCode: 500,
            data: null,
            error: "Failed to parse JSON response: " + e.message,
            source: "MoSPI API",
          });
        }
      });
    });

    req.on("error", (e) => {
      finish({
        statusCode: 503,
        data: null,
        error: e.message,
        source: "MoSPI API",
      });
    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy();
      finish({
        statusCode: 504,
        data: null,
        error: "ETIMEDOUT",
        source: "MoSPI API",
      });
    });

    req.end();
  });
}

/**
 * Generic fetch for MoSPI with TLS 1.2, token injection, and retry handling.
 */
export async function fetchMospiAPI(
  endpoint: string,
  queryParams: Record<string, string | number> = {},
  retryAuth = true,
): Promise<MospiResponse> {
  let token: string | undefined;
  try {
    token = await getValidMospiToken();
  } catch {
    token = undefined;
  }

  const url = new URL(`${MOSPI_BASE_URL}${endpoint}`);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  const maxAttempts = 2;
  let last: MospiResponse | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    last = await onceRequest(url, token);

    // If 401 Unauthorized, invalidate token and retry (or try without expired token)
    if ((last.statusCode === 401 || last.statusCode === 403) && retryAuth && attempt === 1) {
      invalidateMospiToken();
      try {
        token = await getValidMospiToken();
      } catch {
        token = undefined;
      }
      last = await onceRequest(url, token);
      if (last.statusCode === 401 || last.statusCode === 403) return last;
    }

    if (last.statusCode < 400) return last;
    if (last.statusCode === 401 || last.statusCode === 403) return last;
    if (!RETRYABLE.has(last.statusCode)) return last;
    if (attempt < maxAttempts) await sleep(400 * attempt);
  }

  return last!;
}

export interface WPIFilters {
  year?: number;
  month?: number;
  majorGroup?: string;
}

export async function fetchWpiRecords(filters: WPIFilters) {
  const params: Record<string, string | number> = { Format: 'JSON', page: 1, limit: 20 };
  if (filters.year) params.year = filters.year;
  if (filters.month) params.month_code = filters.month;
  if (filters.majorGroup) params.major_group_code = filters.majorGroup;
  return fetchMospiAPI('/api/wpi/getWpiRecords', params);
}
