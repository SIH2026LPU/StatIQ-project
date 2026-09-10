import https from 'https';
import crypto from 'crypto';

// Re-use the same legacy renegotiation agent for login with TLS 1.2 pinned
const httpsAgent = new https.Agent({
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.2',
  keepAlive: false,
});

const MOSPI_BASE_URL = process.env.MOSPI_API_BASE_URL || 'https://api.mospi.gov.in';

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0; // Unix timestamp in milliseconds
let inflightLoginPromise: Promise<string> | null = null;
let manualTokenInvalidated = false;

/**
 * Extracts expiration time from a JWT. Returns null if invalid.
 */
function decodeJwtExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    const parsed = JSON.parse(payload);
    if (parsed.exp) {
      return parsed.exp * 1000;
    }
  } catch (e) {
    // Ignore parse errors, just means it's opaque
  }
  return null;
}

/**
 * Logs into MoSPI using credentials from the environment.
 */
async function loginToMospi(): Promise<string> {
  const username = process.env.MOSPI_USERNAME;
  const email = process.env.MOSPI_EMAIL;
  const password = process.env.MOSPI_PASSWORD;
  const gender = process.env.MOSPI_GENDER;
  const organization = process.env.MOSPI_ORGANIZATION;
  const purpose = process.env.MOSPI_PURPOSE;

  if (!username || !email || !password) {
    throw new Error('MOSPI_AUTHENTICATION_FAILED: Missing required credentials in environment.');
  }

  const payload = JSON.stringify({
    username,
    email,
    password,
    gender: gender || 'Male',
    organization: organization || 'StatIQ AI',
    purpose: purpose || 'Data Sync',
  });

  const url = new URL(`${MOSPI_BASE_URL}/api/users/login`);

  return new Promise((resolve, reject) => {
    console.log('[MOSPI AUTH] Login started');
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      agent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Accept': 'application/json',
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));

      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 400) {
            console.error(`[MOSPI AUTH] Login failed with HTTP ${res.statusCode}`);
            reject(new Error(`MOSPI_AUTHENTICATION_FAILED: HTTP ${res.statusCode}`));
            return;
          }

          const json = JSON.parse(responseBody);
          const token = json.token || (json.data && json.data.token) || json.access_token;
          
          if (!token) {
            console.error('[MOSPI AUTH] Login response did not contain a token');
            reject(new Error('MOSPI_AUTHENTICATION_FAILED: No token received in response.'));
            return;
          }

          console.log('[MOSPI AUTH] Login successful');
          resolve(token);
        } catch (e: any) {
          console.error('[MOSPI AUTH] Failed to parse login response');
          reject(new Error(`MOSPI_AUTHENTICATION_FAILED: Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error('[MOSPI AUTH] Login network error', e);
      reject(new Error(`MOSPI_AUTHENTICATION_FAILED: Network error: ${e.message}`));
    });

    req.on('timeout', () => {
      console.error('[MOSPI AUTH] Login timeout');
      req.destroy();
      reject(new Error('MOSPI_AUTHENTICATION_FAILED: Timeout'));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Returns a valid MoSPI token. Uses cached token if valid.
 * Automatically refreshes single-flight if expired or expiring soon.
 */
export async function getValidMospiToken(): Promise<string> {
  // If the user explicitly provided a token for testing, prefer it if valid and not manually invalidated.
  if (process.env.MOSPI_API_TOKEN && !manualTokenInvalidated) {
     const explicitExp = decodeJwtExp(process.env.MOSPI_API_TOKEN);
     if (!explicitExp || explicitExp > Date.now()) {
         return process.env.MOSPI_API_TOKEN;
     }
  }

  const bufferSeconds = parseInt(process.env.MOSPI_TOKEN_REFRESH_BUFFER_SECONDS || '60', 10);
  const now = Date.now();

  // If we have a cached token and it's not expiring within the buffer window
  if (cachedToken && tokenExpiresAt > now + (bufferSeconds * 1000)) {
    return cachedToken;
  }

  if (cachedToken) {
    console.log('[MOSPI AUTH] Token refresh required');
  }

  // Prevent concurrent logins
  if (inflightLoginPromise) {
    return inflightLoginPromise;
  }

  inflightLoginPromise = (async () => {
    try {
      const token = await loginToMospi();
      
      const exp = decodeJwtExp(token);
      if (exp) {
        tokenExpiresAt = exp;
        console.log(`[MOSPI AUTH] Token expires at: ${new Date(exp).toISOString()}`);
      } else {
        const ttlSeconds = parseInt(process.env.MOSPI_TOKEN_TTL_SECONDS || '900', 10);
        tokenExpiresAt = Date.now() + (ttlSeconds * 1000);
        console.log(`[MOSPI AUTH] Token expires at (fallback TTL): ${new Date(tokenExpiresAt).toISOString()}`);
      }

      cachedToken = token;
      console.log('[MOSPI AUTH] Token refreshed successfully');
      return token;
    } finally {
      // Always clear the inflight promise
      inflightLoginPromise = null;
    }
  })();

  return inflightLoginPromise;
}

/**
 * Forces the token to be invalidated. The next getValidMospiToken() will fetch a new one.
 */
export function invalidateMospiToken() {
  cachedToken = null;
  tokenExpiresAt = 0;
  if (process.env.MOSPI_API_TOKEN) {
    manualTokenInvalidated = true;
  }
}

/**
 * Returns diagnostic information without exposing the token.
 */
export function getMospiAuthStatus() {
  const hasManualOverride = !!process.env.MOSPI_API_TOKEN && !manualTokenInvalidated;
  const manualExp = hasManualOverride ? decodeJwtExp(process.env.MOSPI_API_TOKEN as string) : null;
  const isManualExpired = manualExp ? manualExp < Date.now() : false;

  const hasCredentials = !!process.env.MOSPI_USERNAME && !!process.env.MOSPI_PASSWORD;
  const now = Date.now();
  
  let expiresAtStr = 'N/A';
  let secondsUntilExpiry = 0;
  let refreshRequired = true;
  let authenticated = false;

  if (hasManualOverride && !isManualExpired) {
    authenticated = true;
    if (manualExp) {
       expiresAtStr = new Date(manualExp).toISOString();
       secondsUntilExpiry = Math.floor((manualExp - now) / 1000);
    }
    refreshRequired = false;
  } else if (cachedToken) {
    authenticated = true;
    expiresAtStr = new Date(tokenExpiresAt).toISOString();
    secondsUntilExpiry = Math.max(0, Math.floor((tokenExpiresAt - now) / 1000));
    const bufferSeconds = parseInt(process.env.MOSPI_TOKEN_REFRESH_BUFFER_SECONDS || '60', 10);
    refreshRequired = secondsUntilExpiry < bufferSeconds;
  }

  return {
    configured: hasManualOverride || hasCredentials,
    authenticated,
    expiresAt: expiresAtStr,
    secondsUntilExpiry,
    refreshRequired,
  };
}
