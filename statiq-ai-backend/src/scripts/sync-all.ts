import "dotenv/config";
import { db } from "@/db";
import { dataSourceRegistry } from "@/db/schema";
import { eq } from "drizzle-orm";
import { syncDataGovInResource } from "@/lib/integrations/datagovin/sync";

/**
 * Runs every "live" integration in the data_source_registry table.
 * Mock-mode sources (iGOT, NSSTA, MoSPI, eSankhyiki, UnitData until credentials
 * exist) are intentionally skipped here — see BACKEND_ARCHITECTURE.md Phase 2/3.
 *
 * KNOWN_RESOURCE_IDS lets you pin specific data.gov.in datasets relevant to
 * MoSPI/official-statistics capacity building (e.g. CPI/labour-force adjacent
 * resources) once you've picked them from https://www.data.gov.in/.
 */
const KNOWN_RESOURCE_IDS: string[] = [
  // "example-resource-id-uuid-1",
  // "example-resource-id-uuid-2",
];

async function main() {
  const liveSources = await db
    .select()
    .from(dataSourceRegistry)
    .where(eq(dataSourceRegistry.integrationMode, "live"));

  console.log(`Found ${liveSources.length} live-mode source(s) in the registry.`);

  if (KNOWN_RESOURCE_IDS.length === 0) {
    console.log(
      "No resource IDs configured in KNOWN_RESOURCE_IDS. Add data.gov.in resource UUIDs " +
        "there (see src/scripts/sync-datagovin.ts for how to find one), or run:\n" +
        "  npm run sync:datagovin -- <resource-id>"
    );
    return;
  }

  for (const resourceId of KNOWN_RESOURCE_IDS) {
    console.log(`Syncing ${resourceId} ...`);
    const result = await syncDataGovInResource(resourceId, { maxRecords: 500 });
    console.log(result);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
