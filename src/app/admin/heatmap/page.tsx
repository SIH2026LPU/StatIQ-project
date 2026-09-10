import { Notice } from "@/components/app-shell";
import { workforceSnapshot } from "@/lib/services/intelligence";
import {
  BarChart3,
  Download,
  Info,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";

function getCellColor(score: number) {
  if (score >= 75) {
    return "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-200 font-black border border-emerald-400 dark:border-emerald-600 shadow-sm";
  }
  if (score >= 50) {
    return "bg-amber-100 text-amber-950 dark:bg-amber-950/80 dark:text-amber-200 font-black border border-amber-400 dark:border-amber-600 shadow-sm";
  }
  if (score > 0) {
    return "bg-rose-100 text-rose-950 dark:bg-rose-950/80 dark:text-rose-200 font-black border border-rose-400 dark:border-rose-600 shadow-sm";
  }
  return "bg-surface-container-high/40 text-on-surface-variant/40 font-medium";
}

function getStatusLabel(score: number) {
  if (score >= 75) return "Proficient (≥75)";
  if (score >= 50) return "Developing (50–74)";
  if (score > 0) return "Critical Deficit (<50)";
  return "No Data Recorded";
}

export default function HeatmapPage() {
  const snap = workforceSnapshot();
  const names = snap.heatmap[0]?.competencies.map((c) => c.name) ?? [];

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-outline-variant/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-xs text-primary-container">
            <BarChart3 className="w-3.5 h-3.5" />
            WORKFORCE SKILL DENSITY MATRIX
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Competency Heatmap
          </h1>
          <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
            Multi-dimensional matrix visualizing evidenced competency levels across all statistical departments and competency domains.
          </p>
        </div>

        {/* Legend with High Contrast Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-label-caps text-on-surface-variant bg-surface-container-high/60 p-3 rounded-2xl border border-outline-variant/30">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-400 dark:bg-emerald-950 dark:border-emerald-600 inline-block shadow-sm" />
            <span className="text-emerald-900 dark:text-emerald-300">75+ (Proficient)</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-400 dark:bg-amber-950 dark:border-amber-600 inline-block shadow-sm" />
            <span className="text-amber-900 dark:text-amber-300">50–74 (Developing)</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-100 border border-rose-400 dark:bg-rose-950 dark:border-rose-600 inline-block shadow-sm" />
            <span className="text-rose-900 dark:text-rose-300">&lt;50 (Critical Deficit)</span>
          </span>
        </div>
      </header>

      {/* Heatmap Table Container */}
      <section className="glass-panel rounded-3xl border border-outline-variant/30 p-6 overflow-hidden space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">
              Departmental Competency Matrix
            </h2>
            <p className="text-xs text-on-surface-variant">
              Hover over any cell to inspect division score, proficiency status, and benchmarks.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full min-w-[1000px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="p-3.5 text-left font-display font-bold text-on-surface uppercase tracking-wider text-[11px] bg-surface-container-high/80 rounded-tl-xl sticky left-0 z-10 min-w-[200px]">
                  Department
                </th>
                {names.map((name, idx) => (
                  <th
                    key={name}
                    className={`p-3 text-center font-display font-bold text-on-surface text-[11px] uppercase tracking-wider bg-surface-container-high/80 min-w-[120px] ${
                      idx === names.length - 1 ? "rounded-tr-xl" : ""
                    }`}
                  >
                    <span className="block text-center font-semibold" title={name}>
                      {name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {snap.heatmap.map((row) => (
                <tr key={row.department.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-semibold text-on-surface text-xs whitespace-nowrap sticky left-0 bg-surface/95 backdrop-blur-sm z-10 border-r border-outline-variant/20">
                    <div className="font-bold text-on-surface">{row.department.name}</div>
                    <span className="font-mono text-[10px] text-on-surface-variant font-normal uppercase tracking-wider">
                      {row.department.code}
                    </span>
                  </td>
                  {row.competencies.map((c) => {
                    const score = c.score ? Math.round(c.score) : 0;
                    const tooltip = `${row.department.name} · ${c.name}: ${
                      score ? `${score}/100 — ${getStatusLabel(score)}` : "No assessment data"
                    }`;

                    return (
                      <td key={c.competencyId} className="p-2 text-center">
                        <div
                          title={tooltip}
                          className={`py-2 px-3 rounded-xl font-mono text-xs cursor-default select-none transition-all duration-200 hover:scale-105 ${getCellColor(
                            c.score
                          )}`}
                        >
                          {score ? score : "—"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
