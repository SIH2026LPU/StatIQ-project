import { readFileSync } from "node:fs";
import path from "node:path";

export interface DataSourceRecord {
  id: string;
  source: string;
  officialUrl: string;
  purpose: string;
  access: string;
  integration: string;
  notes: string;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (char === "\n") {
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (char !== "\r") cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) rows.push(row);
  }
  return rows;
}

export function loadDataSourceRegistry(): DataSourceRecord[] {
  const filePath = path.join(process.cwd(), "Api", "DATA_SOURCE_REGISTRY.csv");
  const text = readFileSync(filePath, "utf8");
  const [header, ...rows] = parseCsv(text);
  if (!header) return [];
  return rows.map((values) => {
    const get = (name: string) => values[header.indexOf(name)] ?? "";
    const source = get("source");
    return {
      id: source.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      source,
      officialUrl: get("official_url"),
      purpose: get("purpose"),
      access: get("access"),
      integration: get("integration"),
      notes: get("notes"),
    };
  });
}
