import { officialRepo } from "@/db/official-store";
import { syncAll } from "@/lib/sync";

const TTL_MS = 10 * 60 * 1000;
let lastWarm = 0;
let inflight: Promise<void> | null = null;

export async function ensureOfficialData() {
  if (process.env.SKIP_OFFICIAL_SYNC === "1") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (officialRepo.datasets.size > 0 && Date.now() - lastWarm < TTL_MS) return;
  if (inflight) return inflight;
  inflight = (async () => {
    await syncAll();
    lastWarm = Date.now();
    inflight = null;
  })().catch((error) => {
    inflight = null;
    throw error;
  });
  return inflight;
}
