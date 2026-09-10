export function esankhyikiBaseUrl() {
  return process.env.ESANKHYIKI_BASE_URL?.trim() || "https://esankhyiki.mospi.gov.in";
}

export async function fetchOfficialHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "StatIQ-AI/0.1 (SIH 26101 official-statistics ingest)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10000),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}
