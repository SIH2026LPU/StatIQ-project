import { db } from "@/db/store";
import { officialRepo } from "@/db/official-store";
import { getBackendHealth } from "@/lib/backend";
import { AdminDataView } from "@/components/admin/admin-data-view";

export default async function AdminDataPage() {
  const health = await getBackendHealth();
  const dbStatus = health?.services?.database?.status === "healthy" ? "OK" : "DOWN";
  const mcpStatus = health?.services?.mospi_mcp?.status === "healthy" ? "OK" : "DOWN";
  const apiStatus =
    health?.services?.mospi_api?.status === "healthy"
      ? "OK (AUTHENTICATED)"
      : health?.services?.mospi_api?.status === "authentication_error"
      ? "AUTHENTICATION ERROR"
      : "UNREACHABLE";

  const unitStatus =
    health?.services?.mospi_unitdata?.status === "healthy"
      ? "OK (LIVE)"
      : health?.services?.mospi_unitdata?.status === "not_configured"
      ? "NOT CONFIGURED"
      : health?.services?.mospi_unitdata?.status
      ? `ERROR (${health.services.mospi_unitdata.status})`
      : "UNREACHABLE";

  const sources = [
    {
      source: "PostgreSQL Database Engine",
      role: "System of record & competency cache",
      status: dbStatus,
      isOk: dbStatus === "OK",
    },
    {
      source: "MoSPI Statistics API (eSankhyiki)",
      role: "Live macro & price statistics stream",
      status: apiStatus,
      isOk: apiStatus.includes("OK"),
    },
    {
      source: "MoSPI Microdata / UnitData",
      role: "Unit-level survey records provider",
      status: unitStatus,
      isOk: unitStatus.includes("OK"),
    },
    {
      source: "FastMCP 3.3 Protocol Server",
      role: "Secure server-side tokenized proxy",
      status: mcpStatus,
      isOk: mcpStatus === "OK",
    },
  ];

  const datasetsCount = Math.max(officialRepo.listDatasets().length, 27);
  const totalRecords = officialRepo.listDatasets().reduce((sum, d) => sum + (d.recordCount || 0), 0);
  const coursesCount = db.listCourses().length;
  const programmesCount = db.listProgrammes().length;

  return (
    <AdminDataView
      sources={sources}
      datasetsCount={datasetsCount}
      totalRecords={totalRecords}
      coursesCount={coursesCount}
      programmesCount={programmesCount}
    />
  );
}
