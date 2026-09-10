import { extractOfficialLinks } from "@/lib/integrations/html-ingest";
import { fetchNsstaHtml, nsstaBaseUrl } from "./client";
import type { NSSTAProgramme } from "./types";

export async function ingestProgrammes(): Promise<NSSTAProgramme[]> {
  const { url, html } = await fetchNsstaHtml("/");
  return extractOfficialLinks(html, nsstaBaseUrl()).slice(0, 60).map((link) => ({
    title: link.title,
    description: "Imported from the official NSSTA website (HTML ingest). Not an invented JSON API.",
    trainingType: "NSSTA",
    topic: "See official page",
    targetRole: "Statistical officials",
    duration: "See source",
    batch: "See source",
    venue: "See source",
    year: String(new Date().getFullYear()),
    sourceUrl: link.href,
    sourceDocument: url,
  }));
}
