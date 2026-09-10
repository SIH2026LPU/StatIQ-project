import { getRegistrySnapshot } from "@/lib/integrations/catalog";
import { HomeView } from "@/components/home-view";
import { getBackendHealth } from "@/lib/backend";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const overview = getRegistrySnapshot();
  const health = await getBackendHealth();

  return (
    <HomeView
      backend={health}
      stats={{
        competencies: 0,
        roles: health?.status === "ok" && health?.services?.database?.status === "CONNECTED" ? 2 : 0,
        courses: 0,
        programmes: 0,
        sources: overview.sources.length,
      }}
    />
  );
}
