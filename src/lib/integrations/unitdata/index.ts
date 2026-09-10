export interface UnitDataProvider {
  listDatasets(): Promise<unknown>;
}

export class AuthorizedUnitDataProvider implements UnitDataProvider {
  async listDatasets() {
    const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";
    try {
      const res = await fetch(`${BACKEND_URL}/api/microdata/datasets?page=1`, {
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        return { ok: false, mode: "ERROR", error: `Backend responded HTTP ${res.status}` };
      }
      return res.json();
    } catch (err: any) {
      const timedOut = err?.name === "TimeoutError" || /timeout|aborted/i.test(err?.message ?? "");
      return {
        ok: false,
        mode: timedOut ? "TIMEOUT" : "NETWORK_ERROR",
        error: timedOut
          ? "UnitData backend timed out after 15 s"
          : (err?.message ?? "UnitData backend unreachable"),
      };
    }
  }
}

export function getUnitDataProvider() {
  return new AuthorizedUnitDataProvider();
}
