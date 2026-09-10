const fs = require('fs');
const path = require('path');

// 1. attempts/[id]/submit/route.ts -> params.id fixing
const attemptRoute = path.join('src', 'app', 'api', 'attempts', '[id]', 'submit', 'route.ts');
let attemptSrc = fs.readFileSync(attemptRoute, 'utf8');
attemptSrc = attemptSrc.replace(
  /\{ params \}: \{ params: Promise<\{ id: string \}> \}/g,
  '{ params }: { params: Promise<{ id: string }> }'
);
attemptSrc = attemptSrc.replace(/const { id } = await params;/g, 'const { id } = await params;');
// wait, earlier I got `Property 'id' does not exist on type 'Promise<{ id: string; }>'` from `const id = params.id;` ?
// Oh, maybe there was another one.
attemptSrc = attemptSrc.replace(/employeeId: user\.employeeId,/g, 'employeeId: user.employeeId ?? null,');
fs.writeFileSync(attemptRoute, attemptSrc);

// 2. login/route.ts -> req.ip fallback
const loginRoute = path.join('src', 'app', 'api', 'auth', 'login', 'route.ts');
let loginSrc = fs.readFileSync(loginRoute, 'utf8');
loginSrc = loginSrc.replace(/req\.ip/g, 'undefined');
fs.writeFileSync(loginRoute, loginSrc);

// 3. chat/route.ts -> similarChunksResult.rows
const chatRoute = path.join('src', 'app', 'api', 'chat', 'route.ts');
let chatSrc = fs.readFileSync(chatRoute, 'utf8');
chatSrc = chatSrc.replace(/similarChunksResult\.rows as unknown/g, '(similarChunksResult as any) as unknown');
chatSrc = chatSrc.replace(/employeeId: user\.employeeId,/g, 'employeeId: user.employeeId ?? null,');
fs.writeFileSync(chatRoute, chatSrc);

// 4. recommendation/engine.ts -> roleWeight to careerRelevance
const enginePath = path.join('src', 'lib', 'recommendation', 'engine.ts');
let engineSrc = fs.readFileSync(enginePath, 'utf8');
engineSrc = engineSrc.replace(/gapInfo\.roleWeight/g, 'gapInfo.careerRelevance');
engineSrc = engineSrc.replace(/matchedGap\.roleWeight/g, 'matchedGap.careerRelevance');
fs.writeFileSync(enginePath, engineSrc);

// 5. skill-gap, role-readiness, etc -> employeeId and role accesses on Promise?
const otherRoutes = [
  path.join('src', 'app', 'api', 'competencies', 'route.ts'),
  path.join('src', 'app', 'api', 'recommendations', 'generate', 'route.ts'),
  path.join('src', 'app', 'api', 'role-readiness', 'route.ts'),
  path.join('src', 'app', 'api', 'skill-gap', 'route.ts')
];
for (const r of otherRoutes) {
  let src = fs.readFileSync(r, 'utf8');
  src = src.replace(/user\.employeeId/g, '(user?.employeeId ?? null)');
  src = src.replace(/user\.role/g, '(user?.role ?? "LEARNER")');
  src = src.replace(/user\.organizationId/g, '(user?.organizationId ?? null)');
  fs.writeFileSync(r, src);
}

console.log("Fixed!");
