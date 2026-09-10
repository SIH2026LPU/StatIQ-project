export function nsstaBaseUrl() {
  return process.env.NSSTA_BASE_URL?.trim() || "https://nssta.gov.in";
}

export async function fetchNsstaHtml(path = "/") {
  const url = new URL(path, nsstaBaseUrl()).toString();
  const response = await fetch(url, {
    headers: {
      "User-Agent": "StatIQ-AI/0.1 (SIH 26101 NSSTA HTML ingest — not an API)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10000),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return { url, html: await response.text() };
}
