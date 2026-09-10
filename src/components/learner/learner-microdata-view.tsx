"use client";

import { MicrodataCatalogue } from "@/components/microdata-catalogue";
import { Notice } from "@/components/app-shell";
import { useTranslation } from "@/components/language/language-provider";
import { Database } from "lucide-react";

export function LearnerMicrodataView() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      <header className="space-y-3 pb-2 border-b border-outline-variant/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-xs text-primary-container">
          <Database className="w-3.5 h-3.5" />
          {t("microdata.badge", "OFFICIAL GOVERNMENT SURVEY REPOSITORY")}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          {t("microdata.title", "Official Microdata Catalogue")}
        </h1>
        <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
          {t("microdata.learnerSubtitle", "Search live MoSPI UnitData through the StatIQ backend. Analysis uses official metadata and permitted files only.")}
        </p>
      </header>

      <MicrodataCatalogue detailsBase="/learner/microdata" />
    </div>
  );
}
