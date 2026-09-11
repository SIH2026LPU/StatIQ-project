import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getMcpClient } from "@/lib/integrations/mospi-mcp/client";

// In-memory health cache for ultra-fast responses (10 second TTL)
let cachedHealth: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 10_000;

export async function GET(req: NextRequest) {
  const now = Date.now();
  if (cachedHealth && now - cachedHealth.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedHealth.data, { status: 200 });
  }

  try {
    const MOSPI_MCP_URL = process.env.MOSPI_MCP_URL ?? "http://127.0.0.1:8000/mcp";

    // Run all checks in parallel for sub-100ms response times
    const [dbRes, apiRes, mcpRes, unitRes] = await Promise.allSettled([
      // 1. DB Check (fast 500ms timeout)
      (async () => {
        const start = Date.now();
        try {
          await Promise.race([
            db.execute(sql`SELECT 1`),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 500)),
          ]);
          return { status: "healthy", latencyMs: Date.now() - start };
        } catch (e: any) {
          return { status: "error", latencyMs: Date.now() - start, error: e.message };
        }
      })(),

      // 2. MoSPI API Auth Check
      (async () => {
        const start = Date.now();
        try {
          const { getMospiAuthStatus } = await import("@/lib/integrations/mospi/mospiAuthService");
          const authStatus = getMospiAuthStatus();
          if (!authStatus.configured) {
            return { status: "not_configured", latencyMs: Date.now() - start, error: "MOSPI credentials not configured." };
          }
          if (!authStatus.authenticated) {
            return { status: "authentication_error", latencyMs: Date.now() - start, error: "Token expired." };
          }
          return {
            status: "healthy",
            latencyMs: Date.now() - start,
            authenticated: true,
            tokenExpiresInSeconds: authStatus.secondsUntilExpiry,
          };
        } catch (e: any) {
          return { status: "unreachable", latencyMs: Date.now() - start, error: e.message };
        }
      })(),

      // 3. MCP Check (fast 600ms timeout)
      (async () => {
        const start = Date.now();
        try {
          const client = await Promise.race([
            getMcpClient(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("MCP connect timeout")), 600)),
          ]);
          await Promise.race([
            client.callTool({ name: "list_datasets", arguments: {} }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("MCP tool call timeout")), 600)),
          ]);
          return { status: "healthy", latencyMs: Date.now() - start, url: MOSPI_MCP_URL };
        } catch (e: any) {
          return { status: "error", latencyMs: Date.now() - start, error: e.message, url: MOSPI_MCP_URL };
        }
      })(),

      // 4. UnitData Check
      (async () => {
        const start = Date.now();
        try {
          const { unitDataClient } = await import("@/lib/integrations/mospi/unitdataClient");
          const unit = await Promise.race([
            unitDataClient.health(),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error("UnitData timeout")), 600)),
          ]);
          return {
            status: unit.ok ? unit.status : (unit.mode === "NOT_CONFIGURED" ? "not_configured" : "error"),
            authenticated: Boolean(unit.authenticated),
            latencyMs: Date.now() - start,
            ...(unit.error ? { error: unit.error } : {}),
          };
        } catch (e: any) {
          return { status: "error", latencyMs: Date.now() - start, error: e.message };
        }
      })(),
    ]);

    const dbData = dbRes.status === "fulfilled" ? dbRes.value : { status: "error", error: "Failed to check DB" };
    const apiData = apiRes.status === "fulfilled" ? apiRes.value : { status: "error", error: "Failed to check API" };
    const mcpData = mcpRes.status === "fulfilled" ? mcpRes.value : { status: "error", error: "Failed to check MCP", url: MOSPI_MCP_URL };
    const unitData = unitRes.status === "fulfilled" ? unitRes.value : { status: "error", error: "Failed to check UnitData" };

    const overallStatus =
      dbData.status === "healthy" && mcpData.status === "healthy" && apiData.status === "healthy"
        ? "healthy"
        : "degraded";

    const responsePayload = {
      status: overallStatus,
      services: {
        database: dbData,
        mospi_api: apiData,
        mospi_mcp: mcpData,
        mospi_unitdata: unitData,
      },
      timestamp: new Date().toISOString(),
    };

    cachedHealth = {
      data: responsePayload,
      timestamp: Date.now(),
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
