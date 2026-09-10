import { ingestProgrammes } from "./programmes";

export async function ingestTpac() {
  const rows = await ingestProgrammes();
  return rows.filter((row) => /tpac|training|programme|calendar/i.test(row.title));
}
