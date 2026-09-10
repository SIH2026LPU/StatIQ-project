"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { OfflineIndicator } from "@/components/offline-indicator";
import { SignOutButton } from "@/components/sign-out-button";
import { LanguageSelector } from "@/components/language/language-selector";
import { useTranslation } from "@/components/language/language-provider";
import type { SessionUser } from "@/types/domain";
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Target,
  BarChart3,
  Route,
  BookOpen,
  Award,
  Sparkles,
  FileText,
  Bookmark,
  Users,
  Bell,
  Bot,
  Database,
  Layers,
  Activity,
  HelpCircle,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: boolean;
}

export function AppShell({
  session,
  area,
  children,
}: {
  session: SessionUser;
  area: "learner" | "trainer" | "admin";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const learnerNav: NavItem[] = [
    { href: "/learner", label: t("nav.dashboard", "Dashboard"), icon: LayoutDashboard },
    { href: "/learner/profile", label: t("nav.profile", "Profile"), icon: User },
    { href: "/learner/competencies", label: t("nav.passport", "Passport"), icon: ShieldCheck },
    { href: "/learner/gaps", label: t("nav.skillGaps", "Skill Gaps"), icon: Target },
    { href: "/learner/skills", label: t("nav.gapAnalysis", "Gap Analysis"), icon: BarChart3 },
    { href: "/learner/path", label: t("nav.learningPath", "Learning Path"), icon: Route },
    { href: "/learner/courses", label: t("nav.courses", "Courses"), icon: BookOpen },
    { href: "/learner/assessments", label: t("nav.assessments", "Assessments"), icon: Award },
    { href: "/learner/achievements", label: t("nav.achievements", "Achievements"), icon: Sparkles },
    { href: "/learner/notes", label: t("nav.notes", "Notes"), icon: FileText },
    { href: "/learner/bookmarks", label: t("nav.bookmarks", "Bookmarks"), icon: Bookmark },
    { href: "/learner/community", label: t("nav.community", "Community"), icon: Users },
    { href: "/learner/notifications", label: t("nav.notifications", "Notifications"), icon: Bell, badge: true },
    { href: "/learner/tutor", label: t("nav.aiTutor", "AI Tutor"), icon: Bot },
    { href: "/learner/microdata", label: t("nav.microdata", "Microdata"), icon: Database },
  ];

  const trainerNav: NavItem[] = [
    { href: "/trainer", label: t("nav.dashboard", "Dashboard"), icon: LayoutDashboard },
    { href: "/trainer/courses", label: t("nav.courses", "Courses"), icon: BookOpen },
    { href: "/trainer/quiz", label: t("nav.quizStudio", "Quiz Studio"), icon: Award },
    { href: "/trainer/learners", label: t("nav.learners", "Learners"), icon: Users },
    { href: "/trainer/microdata", label: t("nav.microdata", "Microdata"), icon: Database },
  ];

  const adminNav: NavItem[] = [
    { href: "/admin", label: t("nav.commandCenter", "Command Center"), icon: LayoutDashboard },
    { href: "/admin/data", label: t("nav.data", "Data"), icon: Layers },
    { href: "/admin/data-sources", label: t("nav.dataSources", "Data Sources"), icon: Database },
    { href: "/admin/heatmap", label: t("nav.heatmap", "Heatmap"), icon: BarChart3 },
    { href: "/admin/risk", label: t("nav.skillRisk", "Skill Risk"), icon: Activity },
    { href: "/admin/assistant", label: t("nav.analyticsAssistant", "Analytics Assistant"), icon: Bot },
  ];

  const nav = area === "learner" ? learnerNav : area === "trainer" ? trainerNav : adminNav;

  return (
    <div className="min-h-screen bg-background text-on-surface md:grid md:grid-cols-[270px_1fr] relative transition-colors duration-300">
      {/* Background mesh */}
      <div className="mesh-bg opacity-50 z-0 pointer-events-none" />

      {/* Sidebar */}
      <aside className="border-b border-white/5 bg-surface-container-lowest/90 backdrop-blur-xl md:border-b-0 md:border-r z-10 sticky top-0 md:h-screen flex flex-col">
        <div className="px-6 py-5 border-b border-white/5">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-primary-container/60 flex items-center justify-center font-bold text-black text-sm group-hover:scale-105 transition-transform">
              Σ
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-tight">StatIQ AI</p>
              <p className="text-[10px] text-on-surface-variant font-mono leading-none">MoSPI Intelligent System</p>
            </div>
          </Link>
          <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary-container/20 bg-primary-container/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            <span className="text-[10px] font-label-caps text-primary-container uppercase font-bold">
              {t(`role.${area}`, area)} {t("common.workspace", "Workspace")}
            </span>
          </div>
        </div>
        
        <nav className="flex-1 flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-y-auto custom-scrollbar space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon || HelpCircle;
            const isActive = pathname === item.href || (item.href !== "/learner" && item.href !== "/trainer" && item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                  isActive
                    ? "bg-primary-container/15 text-primary-container font-bold border border-primary-container/30 shadow-[0_0_15px_rgba(57,255,20,0.06)]"
                    : "text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5 hover:text-on-surface border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-primary-container" : "text-on-surface-variant group-hover:text-on-surface"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
                )}
              </Link>
            );
          })}
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container/20 to-secondary-container/20 border border-white/10 flex items-center justify-center font-display font-bold text-on-surface text-sm">
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
