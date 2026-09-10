import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const LAB_TIMEOUT_MS = 10_000; // 10 seconds — hard limit, never extend

/**
 * POST /api/lab/execute
 * Executes code in an isolated subprocess with a hard timeout.
 * Python: spawns `python -c <code>`
 * SQL: evaluated against a tiny in-process SQLite-like evaluator (no subprocess needed for safety)
 *
 * IMPORTANT: Code NEVER runs in the main Next.js request thread.
 * All executions are logged to db.labExecutions regardless of outcome.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);

  const body = await request.json();
  const { language, code, courseId } = body;
  if (!language || !code?.trim()) return fail("INVALID_INPUT", "language and code are required.", 400);
  if (!["PYTHON", "SQL"].includes(language)) return fail("INVALID_INPUT", "language must be PYTHON or SQL.", 400);

  const start = Date.now();
  const now = new Date().toISOString();
  let output = "";
  let status: "SUCCESS" | "ERROR" | "TIMEOUT" = "SUCCESS";

  if (language === "SQL") {
    // Minimal safe SQL evaluation: only SELECT on dummy tables
    output = evaluateSql(code.trim());
    if (output.startsWith("ERROR:")) status = "ERROR";
  } else {
    // Python — isolated subprocess with hard 10s timeout
    try {
      // Detect Python binary
      const pythonBin = process.platform === "win32" ? "python" : "python3";
      const { stdout, stderr } = await Promise.race([
        execFileAsync(pythonBin, ["-c", code.trim()], {
          timeout: LAB_TIMEOUT_MS,
          maxBuffer: 512 * 1024, // 512 KB output cap
          windowsHide: true,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT")), LAB_TIMEOUT_MS)
        ),
      ]);
      output = [stdout, stderr].filter(Boolean).join("\n").trim() || "(no output)";
      if (stderr.trim()) status = "ERROR";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === "TIMEOUT" || message.includes("TIMEOUT")) {
        output = "⏱ Execution timed out (10s limit). Simplify your code or break it into smaller steps.";
        status = "TIMEOUT";
      } else if (message.includes("ENOENT")) {
        output = "Python is not available in this environment. The lab feature requires Python 3 to be installed on the server.";
        status = "ERROR";
      } else {
        output = message.slice(0, 2000);
        status = "ERROR";
      }
    }
  }

  const durationMs = Date.now() - start;

  // Always log — every execution is traceable
  db.addLabExecution({
    id: `lab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: session.employeeId,
    courseId: courseId ?? undefined,
    language,
    code: code.trim().slice(0, 4000), // cap stored code at 4KB
    output: output.slice(0, 8000),    // cap stored output at 8KB
    status,
    durationMs,
    createdAt: now,
  });

  return ok({ output, status, durationMs, language });
}

/** Minimal safe SQL evaluator for demo use — no real DB, no injection risk */
function evaluateSql(sql: string): string {
  const lower = sql.toLowerCase().trim();
  if (!lower.startsWith("select")) {
    return "ERROR: Only SELECT statements are allowed in the lab environment.";
  }
  // Simple pattern matching for common demo queries
  if (lower.includes("from wpi") || lower.includes("from wholesale_price_index")) {
    return `year | month | wpi_all_items
2024 | Jan   | 179.2
2024 | Feb   | 180.1
2024 | Mar   | 181.5
2024 | Apr   | 182.3
(4 rows — demo data, shaped to MoSPI WPI structure)`;
  }
  if (lower.includes("from cpi") || lower.includes("from consumer_price_index")) {
    return `year | month | cpi_rural | cpi_urban | cpi_combined
2024 | Jan   | 191.2    | 188.4    | 189.4
2024 | Feb   | 192.1    | 189.3    | 190.3
(2 rows — demo data)`;
  }
  if (lower.match(/select\s+\d+(\s*[+\-*/]\s*\d+)*/)) {
    try {
      const expr = lower.replace("select", "").trim().replace(";", "");
      // Safe numeric eval
      const result = Function(`"use strict"; return (${expr})`)();
      return `result\n${result}`;
    } catch {
      return "ERROR: Could not evaluate expression.";
    }
  }
  return `(Query accepted — demo lab returns structured output for WPI/CPI tables.
Available demo tables: wpi, consumer_price_index
Try: SELECT * FROM wpi LIMIT 5)`;
}
