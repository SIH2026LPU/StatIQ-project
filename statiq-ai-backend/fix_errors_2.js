const fs = require('fs');
const path = require('path');

// 1. sync/route.ts
const syncRoute = path.join('src', 'app', 'api', 'integrations', 'mospi', 'sync', 'route.ts');
let syncSrc = fs.readFileSync(syncRoute, 'utf8');
syncSrc = syncSrc.replace(/\{ success: true, \.\.\.result \}/g, 'result');
fs.writeFileSync(syncRoute, syncSrc);

// 2. client.ts
const clientTs = path.join('src', 'lib', 'integrations', 'mospi-mcp', 'client.ts');
let clientSrc = fs.readFileSync(clientTs, 'utf8');
clientSrc = clientSrc.replace(/res\.content\[0\]/g, '(res as any).content[0]');
fs.writeFileSync(clientTs, clientSrc);

// 3. sync.ts
const syncTs = path.join('src', 'lib', 'integrations', 'mospi-mcp', 'sync.ts');
let syncLibSrc = fs.readFileSync(syncTs, 'utf8');
syncLibSrc = syncLibSrc.replace(/value: !isNaN\(parseFloat\(value\)\) \? parseFloat\(value\) : null/g, 'value: !isNaN(parseFloat(value)) ? parseFloat(value).toString() : null');
fs.writeFileSync(syncTs, syncLibSrc);

console.log("Fixed!");
