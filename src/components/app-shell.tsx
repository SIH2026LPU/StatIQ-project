"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { OfflineIndicator } from "@/components/offline-indicator";
import { SignOutButton } from "@/components/sign-out-button";
import { LanguageSelector } from "@/components/language/language-selector";
import { useTranslation } from "@/components/language/language-provider";
import type { SessionUser } from "@/types/domain";

export function AppShell({
  session,
  area,
  children,
}: {
  session: SessionUser;
  area: "learner" | "trainer" | "admin";
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  const learnerNav = [
    ["/learner", t("nav.dashboard", "Dashboard")],
    ["/learner/profile", t("nav.profile", "Profile")],
    ["/learner/competencies", t("nav.passport", "Passport")],
    ["/learner/gaps", t("nav.skillGaps", "Skill Gaps")],
    ["/learner/skills", t("nav.gapAnalysis", "Gap Analysis")],
    ["/learner/path", t("nav.learningPath", "Learning Path")],
    ["/learner/courses", t("nav.courses", "Courses")],
    ["/learner/assessments", t("nav.assessments", "Assessments")],
    ["/learner/achievements", t("nav.achievements", "Achievements")],
    ["/learner/notes", t("nav.notes", "Notes")],
    ["/learner/bookmarks", t("nav.bookmarks", "Bookmarks")],
    ["/learner/community", t("nav.community", "Community")],
    ["/learner/notifications", t("nav.notifications", "Notifications")],
    ["/learner/tutor", t("nav.aiTutor", "AI Tutor")],
    ["/learner/microdata", t("nav.microdata", "Microdata")],
  ];

  const trainerNav = [
    ["/trainer", t("nav.dashboard", "Dashboard")],
    ["/trainer/courses", t("nav.courses", "Courses")],
    ["/trainer/quiz", t("nav.quizStudio", "Quiz Studio")],
    ["/trainer/learners", t("nav.learners", "Learners")],
    ["/trainer/microdata", t("nav.microdata", "Microdata")],
  ];

  const adminNav = [
    ["/admin", t("nav.commandCenter", "Command Center")],
    ["/admin/data", t("nav.data", "Data")],
    ["/admin/data-sources", t("nav.dataSources", "Data Sources")],
    ["/admin/heatmap", t("nav.heatmap", "Heatmap")],
    ["/admin/risk", t("nav.skillRisk", "Skill Risk")],
    ["/admin/assistant", t("nav.analyticsAssistant", "Analytics Assistant")],
  ];

  const nav = area === "learner" ? learnerNav : area === "trainer" ? trainerNav : adminNav;

  return (
    <div className="min-h-screen bg-background text-on-surface md:grid md:grid-cols-[260px_1fr] relative transition-colors duration-300">
      {/* Background mesh */}
      <div className="mesh-bg opacity-50 z-0 pointer-events-none" />

      {/* Sidebar */}
      <aside className="border-b border-white/5 bg-surface-container-lowest/80 backdrop-blur-xl md:border-b-0 md:border-r z-10 sticky top-0 md:h-screen flex flex-col">
        <div className="px-6 py-6 border-b border-white/5">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-primary-container/60 flex items-center justify-center font-bold text-black text-sm">
              Σ
            </div>
            <p className="font-display text-lg font-bold tracking-tight">StatIQ AI</p>
          </Link>
          <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary-container/20 bg-primary-container/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            <span className="text-[10px] font-label-caps text-primary-container uppercase">
              {t(`role.${area}`, area)} {t("common.workspace", "Workspace")}
            </span>
          </div>
        </div>
        
        <nav className="flex-1 flex gap-1 overflow-x-auto px-4 py-4 md:flex-col md:overflow-y-auto custom-scrollbar">
          {nav.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-lg px-4 py-2.5 text-sm text-on-surface-variant font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5 hover:text-on-surface active:scale-95 flex items-center justify-between"
            >
              <span>{label}</span>
              {label === t("nav.notifications", "Notifications") && (
                <span className="w-2 h-2 rounded-full bg-secondary-container" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto hidden md:block">
           <p className="text-[10px] text-on-surface-variant/50 font-label-caps text-center">SIH 2026 · PS 26101</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen relative z-10 w-full overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-white/5 bg-surface/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center font-display font-bold text-on-surface">
              {session.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface leading-none">{session.name}</p>
              <p className="text-xs text-on-surface-variant mt-1 uppercase font-label-caps tracking-wider">
                {t(`role.${session.role.toLowerCase()}`, session.role.replace("_", " "))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="dropdown" />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>

        <OfflineIndicator />
        
        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 lg:max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="glass-panel glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between group">
      <div>
        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{label}</p>
        <p className="mt-2 font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-secondary-container">
          {value}
        </p>
      </div>
      {hint ? (
        <p className="mt-4 text-xs text-on-surface-variant/80 border-t border-white/5 pt-3 group-hover:text-on-surface-variant transition-colors line-clamp-1" title={hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Notice() {
  const { t } = useTranslation();
  return (
    <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low border border-white/5 text-sm text-on-surface-variant">
      <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse shrink-0" />
      {t("home.liveConnected", "Connected to Official MoSPI Data Platform via eSankhyiki MCP")}
    </div>
  );
}
