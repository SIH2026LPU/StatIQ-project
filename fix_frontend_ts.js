const fs = require('fs');
const path = require('path');

// 1. data-analysis/route.ts
const dataAnalysisRoute = path.join('src', 'app', 'api', 'ai', 'data-analysis', 'route.ts');
let dataAnalysisSrc = fs.readFileSync(dataAnalysisRoute, 'utf8');
dataAnalysisSrc = dataAnalysisSrc.replace(/, req as any\);/g, ');');
// Also liveResult typings: liveResult is unknown because backendJson returns T|null, so we must type it.
dataAnalysisSrc = dataAnalysisSrc.replace(/const liveResult = await backendJson/g, 'const liveResult = await backendJson<any>');
fs.writeFileSync(dataAnalysisRoute, dataAnalysisSrc);

// 2. mospi API routes (remove req arg from backendJson and getSession)
const mospiRoutes = [
  'src/app/api/mospi/datasets/route.ts',
  'src/app/api/mospi/indicators/route.ts',
  'src/app/api/mospi/query/route.ts',
  'src/app/api/mospi/health/route.ts'
];
for (const route of mospiRoutes) {
  const p = path.join('d:/Projects/StatIQ-AI-project', route);
  let src = fs.readFileSync(p, 'utf8');
  src = src.replace(/getSession\(req\)/g, 'getSession()');
  src = src.replace(/, req\);/g, ');');
  fs.writeFileSync(p, src);
}

// 3. mospi client.ts
const mospiClientTs = path.join('src', 'lib', 'integrations', 'mospi', 'client.ts');
let clientSrc = fs.readFileSync(mospiClientTs, 'utf8');
clientSrc = clientSrc.replace(/records: records as any\[\]/g, 'records: records as never[]');
clientSrc = clientSrc.replace(/records: res as any/g, 'records: res as never[]');
fs.writeFileSync(mospiClientTs, clientSrc);

// 4. page.tsx, sources/page.tsx, components/home-view.tsx
const pageTsx = path.join('src', 'app', 'page.tsx');
let pageSrc = fs.readFileSync(pageTsx, 'utf8');
pageSrc = pageSrc.replace(/health\.competencies/g, '0');
pageSrc = pageSrc.replace(/health\.ok/g, 'health?.status === "ok"');
pageSrc = pageSrc.replace(/health\.postgres/g, 'health?.services?.database?.status');
pageSrc = pageSrc.replace(/health\.courses/g, '0');
pageSrc = pageSrc.replace(/health\.sources/g, '0');
fs.writeFileSync(pageTsx, pageSrc);

const sourcesPageTsx = path.join('src', 'app', 'sources', 'page.tsx');
let sourcesSrc = fs.readFileSync(sourcesPageTsx, 'utf8');
sourcesSrc = sourcesSrc.replace(/health\.ok/g, 'health?.status === "ok"');
sourcesSrc = sourcesSrc.replace(/health\.postgres/g, 'health?.services?.database?.status');
fs.writeFileSync(sourcesPageTsx, sourcesSrc);

const homeViewTsx = path.join('src', 'components', 'home-view.tsx');
let homeViewSrc = fs.readFileSync(homeViewTsx, 'utf8');
homeViewSrc = homeViewSrc.replace(/health\.ok/g, 'health?.status === "ok"');
homeViewSrc = homeViewSrc.replace(/health\.postgres/g, 'health?.services?.database?.status');
fs.writeFileSync(homeViewTsx, homeViewSrc);

console.log("Fixed!");
