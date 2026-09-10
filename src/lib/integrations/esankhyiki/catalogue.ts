import { extractOfficialLinks } from "@/lib/integrations/html-ingest";
import { esankhyikiBaseUrl, fetchOfficialHtml } from "./client";
import type { CatalogueEntry } from "./types";

export async function discoverDatasets(): Promise<CatalogueEntry[]> {
  const html = await fetchOfficialHtml(esankhyikiBaseUrl());
  return extractOfficialLinks(html, esankhyikiBaseUrl()).slice(0, 80);
}

export async function getDatasetMetadata(href: string) {
  return { title: href, sourceUrl: href };
}
