"use client";

import { Database } from "lucide-react";
import type { OfficialDataset } from "@/db/official-store";

export function LabClient({ datasets }: { datasets: OfficialDataset[] }) {
  return (
    <div className="glass-panel rounded-3xl p-12 text-center border border-white/5">
      <Database className="w-16 h-16 text-primary-container mx-auto mb-6" />
      <h2 className="font-display text-3xl font-bold text-on-surface mb-4">
        Interactive Data Workbench
      </h2>
      <p className="text-on-surface-variant max-w-2xl mx-auto mb-8">
        Access {datasets.length} official datasets from MoSPI, NSSO, and eSankhyiki.
        (Note: The public workbench UI is currently undergoing maintenance and will be restored shortly.)
      </p>
      <div className="grid md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto mt-8">
        {datasets.slice(0, 4).map(d => (
          <div key={d.id} className="p-4 rounded-xl bg-surface-container-low border border-white/5">
            <h3 className="font-bold text-on-surface text-sm">{d.name}</h3>
            <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{d.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
