import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getMcpClient } from "@/lib/integrations/mospi-mcp/client";

export async function GET(req: NextRequest) {
  try {
    // 1. Check DB
    const dbStart = Date.now();
    let dbStatus = "healthy";
    let dbError = undefined;
    try {
      await Promise.race([
        db.execute(sql`SELECT 1`),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DB connection timeout")), 2000))
      ]);
    } catch (e: any) {
      dbStatus = "error";
      dbError = e.message;
    }
    const dbLatency = Date.now() - dbStart;

    // 2. Check MoSPI API directly using new service
    const apiStart = Date.now();
    let apiStatus = "healthy";
    let apiError = undefined;
    let isAuthenticated = false;
    let tokenExpiresInSeconds = 0;
    
    try {
      const { getMospiAuthStatus } = await import("@/lib/integrations/mospi/mospiAuthService");
      const authStatus = getMospiAuthStatus();
      
      if (!authStatus.configured) {
        apiStatus = "not_configured";
        apiError = "MOSPI_USERNAME/PASSWORD or token not configured.";
      } else if (!authStatus.authenticated) {
        apiStatus = "authentication_error";
        apiError = "Token expired and refresh failed/pending.";
      } else {
        isAuthenticated = true;
        tokenExpiresInSeconds = authStatus.secondsUntilExpiry;
        apiStatus = "healthy";
      }
    } catch (e: any) {
      apiStatus = "unreachable";
      apiError = e.message;
    }
    const apiLatency = Date.now() - apiStart;

    // 3. Check MCP Server
    const mcpStart = Date.now();
    let mcpStatus = "healthy";
    let mcpError = undefined;
    const MOSPI_MCP_URL = process.env.MOSPI_MCP_URL ?? "http://127.0.0.1:8000/mcp";
    try {
      const client = await Promise.race([
        getMcpClient(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("MCP connect timeout")), 2500))
      ]);
      await Promise.race([
        client.callTool({ name: "list_datasets", arguments: {} }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("MCP tool call timeout")), 3000))
      ]);
    } catch (e: any) {
      mcpStatus = "error";
      mcpError = e.message;
    }
    const mcpLatency = Date.now() - mcpStart;

    const unitStart = Date.now();
    let unitStatus = "not_configured";
    let unitAuthenticated = false;
    let unitError: string | undefined;
    try {
      const { unitDataClient } = await import("@/lib/integrations/mospi/unitdataClient");
      const unit = await unitDataClient.health();
      if (unit.ok) {
        unitStatus = unit.status;
        unitAuthenticated = Boolean(unit.authenticated);
        unitError = unit.error;
      } else {
        unitStatus = unit.mode === "NOT_CONFIGURED" ? "not_configured" : "error";
        unitAuthenticated = false;
        unitError = unit.error;
      }
    } catch (e: any) {
      unitStatus = "error";
      unitError = e.message;
    }
    const unitLatency = Date.now() - unitStart;

    const overallStatus = (dbStatus === "healthy" && mcpStatus === "healthy" && apiStatus === "healthy") ? "healthy" : "degraded";

    return NextResponse.json({
      status: overallStatus,
      services: {
        database: { status: dbStatus, latencyMs: dbLatency, error: dbError },
        mospi_api: {
          status: apiStatus,
          latencyMs: apiLatency,
          ...(apiError ? { error: apiError } : {}),
          authenticated: isAuthenticated,
          ...(isAuthenticated ? { tokenExpiresInSeconds } : {})
        },
        mospi_mcp: { status: mcpStatus, latencyMs: mcpLatency, error: mcpError, url: MOSPI_MCP_URL },
        mospi_unitdata: {
          status: unitStatus,
          authenticated: unitAuthenticated,
          latencyMs: unitLatency,
          ...(unitError ? { error: unitError } : {}),
        },
      },
      timestamp: new Date().toISOString(),
    }, { status: 200 }); // Always 200 even if degraded, so frontend can display the exact degraded component.

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
