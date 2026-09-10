import { Notice } from "@/components/app-shell";
import { workforceSnapshot } from "@/lib/services/intelligence";
import {
  BarChart3,
  Download,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";

function getCellColor(score: number) {
  if (score >= 75)
    return "bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30";
  if (score >= 50)
    return "bg-amber-500/25 text-amber-800 dark:text-amber-300 font-medium border border-amber-500/30";
  if (score > 0)
    return "bg-rose-500/25 text-rose-800 dark:text-rose-300 font-medium border border-rose-500/30";
  return "bg-surface-container-high/40 text-on-surface-variant/40";
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

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-label-caps text-on-surface-variant bg-surface-container-high/40 p-2.5 rounded-xl border border-outline-variant/30">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/60 inline-block" />
            75+ (Proficient)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/60 inline-block" />
            50–74 (Developing)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/40 border border-rose-500/60 inline-block" />
            &lt;50 (Critical Deficit)
          </span>
        </div>
      </header>

      {/* Heatmap Table Container */}
      <section className="glass-panel rounded-3xl border border-outline-variant/30 p-6 overflow-hidden space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="p-3 text-left font-display font-bold text-on-surface uppercase tracking-wider text-[11px] bg-surface-container-high/60 rounded-tl-xl">
                  Department
                </th>
                {names.map((name, idx) => (
                  <th
                    key={name}
                    className={`p-3 text-left font-display font-bold text-on-surface text-[11px] uppercase tracking-wider bg-surface-container-high/60 ${
                      idx === names.length - 1 ? "rounded-tr-xl" : ""
                    }`}
                  >
                    <span className="line-clamp-1 max-w-[120px]" title={name}>
                      {name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {snap.heatmap.map((row) => (
                <tr key={row.department.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-semibold text-on-surface text-xs whitespace-nowrap">
                    <div>{row.department.name}</div>
                    <span className="font-mono text-[10px] text-on-surface-variant font-normal">
                      {row.department.code}
                    </span>
                  </td>
                  {row.competencies.map((c) => (
                    <td key={c.competencyId} className="p-2 text-center">
                      <div
                        className={`py-2 px-2.5 rounded-xl font-mono text-xs transition-all ${getCellColor(
                          c.score
                        )}`}
                      >
                        {c.score ? Math.round(c.score) : "—"}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
