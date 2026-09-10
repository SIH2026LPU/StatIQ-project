const fs = require('fs');
const path = require('path');

const files = [
  'src/app/api/mospi/datasets/route.ts',
  'src/app/api/mospi/indicators/route.ts',
  'src/app/api/mospi/query/route.ts'
];

for (const file of files) {
  const fullPath = path.join('d:/Projects/StatIQ-AI-project/statiq-ai-backend', file);
  let src = fs.readFileSync(fullPath, 'utf8');
  src = src.replace(/requireSession/g, 'getSession');
  src = src.replace(/const auth = await getSession\(req\);\n  if \(\!auth\.ok\) return auth\.response;/g, 'const user = await getSession(req);\n  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });');
  fs.writeFileSync(fullPath, src);
}
console.log("Fixed!");
