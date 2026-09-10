export function extractOfficialLinks(html: string, baseUrl: string) {
  const results: Array<{ title: string; href: string }> = [];
  const re = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  const skip =
    /^(home|login|skip|facebook|twitter|instagram|youtube|contact|copyright|accessibility)$/i;
  while ((match = re.exec(html))) {
    const hrefRaw = match[1] ?? "";
    const title = (match[2] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (title.length < 12 || title.length > 160) continue;
    if (skip.test(title)) continue;
    let href = hrefRaw;
    try {
      href = new URL(hrefRaw, baseUrl).toString();
    } catch {
      continue;
    }
    if (!href.startsWith("http")) continue;
    results.push({ title, href });
  }
  const seen = new Set<string>();
  return results.filter((row) => {
    const key = row.href;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
