import "dotenv/config";
import { syncDataGovInResource } from "@/lib/integrations/datagovin/sync";

/**
 * Usage:
 *   npm run sync:datagovin -- <resource-id> [maxRecords]
 *
 * Find a resource-id by browsing https://www.data.gov.in/ , opening any
 * dataset with an "API" tab, and copying the UUID shown in the sample URL
 * (the same UUID also appears in the URL of the dataset's page).
 */
async function main() {
  const resourceId = process.argv[2];
  const maxRecords = process.argv[3] ? Number(process.argv[3]) : undefined;

  if (!resourceId) {
    console.error("Usage: npm run sync:datagovin -- <resource-id> [maxRecords]");
    process.exit(1);
  }

  console.log(`Syncing data.gov.in resource ${resourceId} ...`);
  const result = await syncDataGovInResource(resourceId, { maxRecords });
  console.log(result);
  process.exit(result.status === "SUCCESS" ? 0 : 1);
}

main();
