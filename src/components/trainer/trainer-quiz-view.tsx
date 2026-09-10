"use client";

import { QuizStudio } from "@/components/quiz-studio";
import { Notice } from "@/components/app-shell";
import { useTranslation } from "@/components/language/language-provider";
import { Sparkles } from "lucide-react";

interface Draft {
  id: string;
  prompt: string;
  status: string;
  difficulty: string;
}

interface TrainerQuizViewProps {
  competencies: Array<{ id: string; name: string }>;
  drafts: Draft[];
}

export function TrainerQuizView({ competencies, drafts }: TrainerQuizViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="space-y-3 pb-2 border-b border-outline-variant/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-xs text-primary-container">
          <Sparkles className="w-3.5 h-3.5" />
          {t("quiz.badge", "AI QUESTION GENERATOR & CURATION STUDIO")}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          {t("nav.quizStudio", "AI Quiz Studio")}
        </h1>
        <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
          {t("quiz.subtitle", "Generate rigorous, domain-specific quiz items grounded in official MoSPI statistics, sample designs, and economic definitions. Review and publish items into the live assessment bank.")}
        </p>
      </header>

      <QuizStudio competencies={competencies} initialDrafts={drafts} />
    </div>
  );
}
