import { MicrodataCatalogue } from "@/components/microdata-catalogue";
import { Notice } from "@/components/app-shell";
import { Database, ShieldCheck } from "lucide-react";

export default function TrainerMicrodataPage() {
  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="space-y-3 pb-2 border-b border-outline-variant/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tertiary-container/30 bg-tertiary-container/10 font-label-caps text-xs text-tertiary-fixed-dim">
          <Database className="w-3.5 h-3.5" />
          MOSPI MICRODATA / UNIT DATA CATALOGUE
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          Assign Official Microdata Datasets
        </h1>
        <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
          Browse unit-level records from NSS, ASI, PLFS, and Economic Census. Assign dataset access directly to training cohorts and individual statistical officers.
        </p>
      </header>

      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/30">
        <MicrodataCatalogue detailsBase="/trainer/microdata" allowAssign />
      </div>
    </div>
  );
}
