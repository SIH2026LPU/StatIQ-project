import { extractOfficialLinks } from "@/lib/integrations/html-ingest";
import { describe, expect, it } from "vitest";

describe("extractOfficialLinks", () => {
  it("keeps unique http links with useful titles", () => {
    const html = `
      <a href="/training/calendar">NSSTA Training Calendar 2026</a>
      <a href="/training/calendar">NSSTA Training Calendar 2026</a>
      <a href="https://nssta.gov.in/tpac">TPAC programme guidelines and schedule</a>
      <a href="/home">Home</a>
    `;
    const rows = extractOfficialLinks(html, "https://nssta.gov.in/");
    expect(rows.some((row) => row.title.includes("Training Calendar"))).toBe(true);
    expect(rows.filter((row) => row.href.includes("calendar")).length).toBe(1);
  });
});
