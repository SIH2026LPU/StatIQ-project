import { listSourceHealth } from "@/lib/sync";
import { ensureOfficialData } from "@/lib/sync/ensure";
import { AdminDataSourcesView } from "@/components/admin/admin-data-sources-view";

export default async function AdminDataSourcesPage() {
  await ensureOfficialData().catch(() => undefined);
  const sources = listSourceHealth();

  return (
    <AdminDataSourcesView
      sources={sources.map((s) => ({
        source: s.source,
        officialUrl: s.officialUrl,
        status: s.status,
        lastSync: s.lastSync ? String(s.lastSync) : null,
        lastSuccess: s.lastSuccess ? String(s.lastSuccess) : null,
        lastError: s.lastError,
        recordCount: s.recordCount,
      }))}
    />
  );
}
