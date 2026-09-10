import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function getAllFiles(dir: string, fileList: string[] = []) {
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith(".ts")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getAllFiles("src/app/api");

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const updated = content.replace(/const user = getSession\(req\);/g, "const user = await getSession(req);");
  if (content !== updated) {
    writeFileSync(file, updated);
    console.log("Updated", file);
  }
}

// Also fix `params` type in route handlers. Next.js 15 requires params to be Promise<{ ... }>
const attemptRoute = join("src", "app", "api", "attempts", "[id]", "submit", "route.ts");
if (files.includes(attemptRoute)) {
    const content = readFileSync(attemptRoute, "utf-8");
    const updated = content.replace(/\{ params \}: \{ params: \{ id: string \} \}/g, "{ params }: { params: Promise<{ id: string }> }");
    const updated2 = updated.replace(/const id = params\.id;/g, "const { id } = await params;");
    writeFileSync(attemptRoute, updated2);
    console.log("Updated attempt route params");
}
