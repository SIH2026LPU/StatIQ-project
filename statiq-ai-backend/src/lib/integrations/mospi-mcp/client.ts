import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MOSPI_MCP_URL = process.env.MOSPI_MCP_URL ?? "http://127.0.0.1:8000/mcp";

let mcpClient: Client | null = null;
let isConnecting = false;
let connectPromise: Promise<void> | null = null;

export async function getMcpClient(): Promise<Client> {
  if (mcpClient) return mcpClient;

  if (isConnecting && connectPromise) {
    await connectPromise;
    return mcpClient!;
  }

  isConnecting = true;
  connectPromise = (async () => {
    try {
      const transport = new StreamableHTTPClientTransport(new URL(MOSPI_MCP_URL));
      const client = new Client(
        {
          name: "statiq-ai-backend",
          version: "1.0.0",
        },
        {
          capabilities: {},
        }
      );

      // We add a listener for error events to auto-reconnect if needed, or simply log.
      client.onerror = (error) => {
        console.error("MCP Client Error:", error);
      };

      await client.connect(transport);
      mcpClient = client;
    } catch (error) {
      mcpClient = null;
      throw error;
    } finally {
      isConnecting = false;
    }
  })();

  await connectPromise;
  return mcpClient!;
}

// ─── Typed tool responses ────────────────────────────────────────────────────

export interface DatasetInfo {
  name: string;
  description: string;
  use_for: string;
}

export interface ListDatasetsResult {
  total_datasets: number;
  datasets: Record<string, DatasetInfo>;
}

export interface DataRecord {
  [key: string]: string | number | null;
}

export interface GetDataResult {
  data?: DataRecord[] | { data?: DataRecord[] };
  statusCode?: boolean;
  [key: string]: unknown;
}

export async function mcpListDatasets(): Promise<ListDatasetsResult> {
  const client = await getMcpClient();
  const res = await client.callTool({
    name: "list_datasets",
    arguments: {},
  });

  // Depending on how python fastmcp formats it, it might be in content[0].text or structured_content
  const content = (res as any).content[0] as { type: "text"; text: string };
  try {
    return JSON.parse(content.text) as ListDatasetsResult;
  } catch {
    return content.text as unknown as ListDatasetsResult;
  }
}

export async function mcpGetData(
  dataset: string,
  filters: Record<string, unknown>
): Promise<GetDataResult> {
  const client = await getMcpClient();
  const res = await client.callTool({
    name: "get_data",
    arguments: { dataset, ...filters },
  });

  const content = (res as any).content[0] as { type: "text"; text: string };
  try {
    return JSON.parse(content.text) as GetDataResult;
  } catch {
    return content.text as unknown as GetDataResult;
  }
}

export interface IndicatorEntry {
  indicator_code: number;
  description: string;
  viz: string;
  definition: string;
}

export interface GetIndicatorsResult {
  indicators_by_frequency: Record<string, IndicatorEntry[]>;
  _note?: string;
  statusCode?: boolean;
}

export interface MetadataFilterValues {
  year?: { year: string }[];
  year_type?: { year_type_code: number; description: string }[];
  state?: { state_code: number; description: string }[];
  gender?: { gender_code: number; description: string }[];
  sector?: { sector_code: number; description: string }[];
  age?: { age_code: number; description: string }[];
  frequency?: { frequency_code: number; description: string }[];
  [key: string]: unknown;
}

export interface GetMetadataResult {
  dataset: string;
  filter_values: { data: MetadataFilterValues };
}

export async function mcpGetIndicators(dataset: string): Promise<GetIndicatorsResult> {
  const client = await getMcpClient();
  const res = await client.callTool({
    name: "get_indicators",
    arguments: { dataset },
  });

  const content = (res as any).content[0] as { type: "text"; text: string };
  try {
    return JSON.parse(content.text) as GetIndicatorsResult;
  } catch {
    return content.text as unknown as GetIndicatorsResult;
  }
}

export async function mcpGetMetadata(
  dataset: string,
  indicatorCode: number,
  frequencyCode = 1
): Promise<GetMetadataResult> {
  const client = await getMcpClient();
  const res = await client.callTool({
    name: "get_metadata",
    arguments: {
      dataset,
      indicator_code: indicatorCode,
      frequency_code: frequencyCode,
    },
  });

  const content = (res as any).content[0] as { type: "text"; text: string };
  try {
    return JSON.parse(content.text) as GetMetadataResult;
  } catch {
    return content.text as unknown as GetMetadataResult;
  }
}
