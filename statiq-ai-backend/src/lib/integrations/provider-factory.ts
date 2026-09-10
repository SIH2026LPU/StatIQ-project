import type { IGOTProvider, NSSTAProvider } from "./types";
import { MockIGOTProvider } from "./igot/mock-provider";
import { MockNSSTAProvider } from "./nssta/mock-provider";

/**
 * Single place that decides mock vs. production for each external integration.
 * Domain code (recommendation engine, sync jobs, API routes) should always go
 * through these functions and never import a *-provider.ts directly — that is
 * what makes "swap mock for the official iGOT adapter" a one-line change later.
 */
export function getIGOTProvider(): IGOTProvider {
  const mode = process.env.IGOT_INTEGRATION_MODE ?? "mock";
  if (mode === "live") {
    if (!process.env.IGOT_API_BASE_URL || !process.env.IGOT_API_KEY) {
      throw new Error(
        "IGOT_INTEGRATION_MODE=live but IGOT_API_BASE_URL/IGOT_API_KEY are not set. " +
          "Falling back is intentionally NOT done here — fix the env instead of silently " +
          "using mock data in what looks like a production path."
      );
    }
    // Implement OfficialIGOTProvider against the interface in ./types.ts once
    // credentials + endpoint spec are supplied by the iGOT integration authority.
    throw new Error("OfficialIGOTProvider is not implemented yet — see src/lib/integrations/igot/");
  }
  return new MockIGOTProvider();
}

export function getNSSTAProvider(): NSSTAProvider {
  const mode = process.env.NSSTA_INTEGRATION_MODE ?? "mock";
  if (mode === "live") {
    throw new Error("Official NSSTA adapter is not implemented yet — see src/lib/integrations/nssta/");
  }
  return new MockNSSTAProvider();
}
