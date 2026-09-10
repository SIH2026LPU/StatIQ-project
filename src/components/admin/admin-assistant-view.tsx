"use client";

import { AnalyticsAssistant } from "@/components/analytics-assistant";
import { Notice } from "@/components/app-shell";
import { useTranslation } from "@/components/language/language-provider";
import { Brain } from "lucide-react";

export function AdminAssistantView() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="space-y-3 pb-2 border-b border-outline-variant/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-xs text-primary-container">
          <Brain className="w-3.5 h-3.5" />
          {t("assistant.badge", "EXECUTIVE WORKFORCE AI ANALYST")}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          {t("nav.analyticsAssistant", "AI Analytics Assistant")}
        </h1>
        <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
          {t("assistant.subtitle", "Ask high-level strategic workforce questions across authorized aggregate competency, training, and department data. Individual restricted records remain strictly protected.")}
        </p>
      </header>

      <AnalyticsAssistant />
    </div>
  );
}
