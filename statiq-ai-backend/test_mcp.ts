import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function main() {
    try {
        const transport = new StreamableHTTPClientTransport(new URL("http://127.0.0.1:8000/mcp"));
        const client = new Client({ name: "test", version: "1.0.0" }, { capabilities: {} });
        await client.connect(transport);
        console.log("Connected");
        const res = await client.callTool({ name: "list_datasets", arguments: {} });
        console.log("Response:", res);
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
main();
