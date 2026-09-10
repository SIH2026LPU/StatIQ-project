"use client";

import { useState } from "react";
import { Code2, Play, ArrowLeft, Terminal, Clock, CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

const STARTER_PYTHON = `import statistics

# MoSPI WPI data (demo — shaped to real API response)
wpi_data = [179.2, 180.1, 181.5, 182.3, 183.0, 181.8, 182.5]
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]

mean_wpi = statistics.mean(wpi_data)
std_wpi = statistics.stdev(wpi_data)
change = ((wpi_data[-1] - wpi_data[0]) / wpi_data[0]) * 100

print(f"WPI Statistics (Jan–Jul 2024)")
print(f"─────────────────────────────")
print(f"Mean:   {mean_wpi:.2f}")
print(f"StdDev: {std_wpi:.2f}")
print(f"Change: {change:.2f}%")

# Monthly changes
for i in range(1, len(wpi_data)):
    delta = wpi_data[i] - wpi_data[i-1]
    print(f"{months[i]}: {wpi_data[i]:.1f} ({'+' if delta >= 0 else ''}{delta:.1f})")
`;

const STARTER_SQL = `-- Available demo tables: wpi, consumer_price_index
-- Example query:
SELECT *
FROM wpi
LIMIT 5;`;

interface Execution {
  id: string;
  language: string;
  code: string;
  output?: string;
  status: string;
  durationMs?: number;
  createdAt: string;
}

export function LmsLabClient({
  course,
  history,
}: {
  course: { id: string; title: string; provider: string };
  history: Execution[];
}) {
  const [language, setLanguage] = useState<"PYTHON" | "SQL">("PYTHON");
  const [code, setCode] = useState(STARTER_PYTHON);
  const [output, setOutput] = useState<{ text: string; status: string; durationMs: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const run = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setOutput(null);
    const res = await fetch("/api/lab/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code, courseId: course.id }),
    });
    const json = await res.json();
    setOutput({ text: json.data?.output ?? "No output", status: json.data?.status ?? "ERROR", durationMs: json.data?.durationMs ?? 0 });
    setRunning(false);
  };

  const switchLang = (lang: "PYTHON" | "SQL") => {
    setLanguage(lang);
    setCode(lang === "PYTHON" ? STARTER_PYTHON : STARTER_SQL);
    setOutput(null);
  };

  const statusIcon = (s: string) => {
    if (s === "SUCCESS") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === "TIMEOUT") return <Clock className="w-4 h-4 text-amber-400" />;
    return <AlertTriangle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${course.id}/learn`} className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to course
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="font-display font-bold text-on-surface text-sm">
            Virtual Lab · {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="flex rounded-full overflow-hidden border border-white/10">
            {(["PYTHON", "SQL"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => switchLang(lang)}
                className={`px-4 py-1.5 text-xs font-label-caps transition-all ${
                  language === lang
                    ? "bg-primary-container text-black"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={run}
            disabled={running}
            className="flex items-center gap-2 glow-button px-5 py-2 rounded-full font-label-caps text-black text-xs disabled:opacity-60"
          >
            {running ? (
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-center gap-2 px-6 py-2 bg-amber-500/5 border-b border-amber-500/10 text-xs text-amber-400 shrink-0">
        <Info className="w-3.5 h-3.5 shrink-0" />
        Code runs in an isolated subprocess with a 10-second timeout. All executions are logged. Never shares data with third parties.
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-surface-container-lowest/80 shrink-0">
            <Code2 className="w-4 h-4 text-primary-container" />
            <span className="text-xs font-label-caps text-on-surface-variant">
              {language === "PYTHON" ? "main.py" : "query.sql"}
            </span>
          </div>
          <textarea
            className="flex-1 bg-surface-container-lowest font-mono text-sm text-on-surface p-6 resize-none focus:outline-none leading-relaxed custom-scrollbar"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder={`Write your ${language} code here...`}
          />
        </div>

        {/* Output panel */}
        <div className="w-96 border-l border-white/5 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-surface-container-lowest/80 shrink-0">
            <Terminal className="w-4 h-4 text-secondary-container" />
            <span className="text-xs font-label-caps text-on-surface-variant">Output</span>
            {output && (
              <div className="flex items-center gap-1.5 ml-auto">
                {statusIcon(output.status)}
                <span className={`text-[10px] font-label-caps ${
                  output.status === "SUCCESS" ? "text-emerald-400" : output.status === "TIMEOUT" ? "text-amber-400" : "text-red-400"
                }`}>
                  {output.status} · {output.durationMs}ms
                </span>
              </div>
            )}
          </div>

          {!output && !running && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-on-surface-variant/50">
                <Terminal className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-xs">Click Run to execute your code</p>
              </div>
            </div>
          )}

          {running && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-on-surface-variant">
                <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs">Executing (10s timeout)...</p>
              </div>
            </div>
          )}

          {output && (
            <pre className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-xs text-on-surface leading-relaxed whitespace-pre-wrap">
              {output.text}
            </pre>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="border-t border-white/5 shrink-0">
              <button
                onClick={() => setShowHistory((s) => !s)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="font-label-caps">Execution History ({history.length})</span>
                {showHistory ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {showHistory && (
                <div className="max-h-48 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                  {history.map((h) => (
                    <div key={h.id} className="px-4 py-2 hover:bg-white/3">
                      <div className="flex items-center gap-2">
                        {statusIcon(h.status)}
                        <span className="text-[10px] font-label-caps text-on-surface-variant">{h.language}</span>
                        <span className="text-[10px] text-on-surface-variant/50 ml-auto">{new Date(h.createdAt).toLocaleTimeString()}</span>
                      </div>
                      {h.output && (
                        <p className="text-[10px] text-on-surface-variant/70 mt-1 line-clamp-2 font-mono">{h.output}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
