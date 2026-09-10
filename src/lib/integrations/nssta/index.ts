import { ingestCalendar } from "./calendar";
import { ingestProgrammes } from "./programmes";
import { ingestTpac } from "./tpac";
import type { NSSTAProvider } from "./types";

export class HtmlIngestNSSTAProvider implements NSSTAProvider {
  mode = "html-ingest" as const;
  listProgrammes = ingestProgrammes;
  listCalendar = ingestCalendar;
  listTpac = ingestTpac;
}

export function getNSSTAProvider(): NSSTAProvider {
  return new HtmlIngestNSSTAProvider();
}

export { ingestProgrammes } from "./programmes";
export { ingestCalendar } from "./calendar";
export { ingestTpac } from "./tpac";
export type { NSSTAProgramme, NSSTAProvider } from "./types";
