import { MockIGOTProvider } from "./mock-provider";
import { OfficialIGOTProvider } from "./official-provider";
import type { IGOTProvider } from "./types";

/**
 * Returns true only when all three required env vars are present.
 * If IGOT_INTEGRATION_MODE=live is set WITHOUT real credentials, the
 * OfficialIGOTProvider constructor will throw loudly — not silently fall back.
 */
export function officialIgotConfigured() {
  return (
    (process.env.IGOT_PROVIDER === "official" ||
      process.env.IGOT_INTEGRATION_MODE === "live") &&
    Boolean(process.env.IGOT_API_BASE_URL) &&
    Boolean(process.env.IGOT_API_KEY)
  );
}

export function getIGOTProvider(): IGOTProvider {
  if (officialIgotConfigured()) {
    // This will throw loudly if credentials are incomplete — intentional.
    return new OfficialIGOTProvider();
  }
  return new MockIGOTProvider();
}

export { MockIGOTProvider } from "./mock-provider";
export { OfficialIGOTProvider } from "./official-provider";
export type {
  CourseFilters,
  CourseBatch,
  SunbirdEnrollment,
  ContentState,
  CreateBatchInput,
  ListBatchesFilter,
  IGOTProvider,
} from "./types";
