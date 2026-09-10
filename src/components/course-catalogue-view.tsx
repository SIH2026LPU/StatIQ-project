"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useTranslation } from "@/components/language/language-provider";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Clock,
  ArrowRight,
} from "lucide-react";

interface CourseItem {
  id: string;
  title: string;
  description: string;
  provider: string;
  difficulty: string;
  durationHours: number;
  competencies: string[];
}

interface CourseCatalogueViewProps {
  courses: CourseItem[];
  igotStatus: string;
  initialQuery?: string;
  initialProvider?: string;
  initialDifficulty?: string;
}

export function CourseCatalogueView({
  courses,
  igotStatus,
  initialQuery = "",
  initialProvider = "",
  initialDifficulty = "",
}: CourseCatalogueViewProps) {
  const { t, tEntity } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [provider, setProvider] = useState(initialProvider);
  const [difficulty, setDifficulty] = useState(initialDifficulty);

  const filteredCourses = courses.filter((course) => {
    const text = `${course.title} ${course.description}`.toLowerCase();
    const matchQ = !query || text.includes(query.toLowerCase());
    const matchP = !provider || course.provider === provider;
    const matchD = !difficulty || course.difficulty === difficulty;
    return matchQ && matchP && matchD;
  });

  return (
    <>
      <div className="mesh-bg" />
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[85vh] space-y-12">
        {/* Hero Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary-fixed-dim font-label-caps text-xs">
            <BookOpen className="w-3.5 h-3.5 text-primary-container" />
            {t("courses.catalogueBadge", "COMPETENCY-ALIGNED LEARNING CATALOGUE")}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                {t("courses.title", "Courses & Skill Pathways")}
              </h1>
              <p className="mt-3 text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                {t("courses.subtitle", "Explore statistical training curricula from iGOT Karmayogi, National Statistical Systems Training Academy (NSSTA), and internal MoSPI modules.")}
              </p>
            </div>

            <div className="glass-panel px-4 py-2.5 rounded-2xl border border-outline-variant/30 flex items-center gap-2 text-xs font-label-caps text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("courses.igotAdapter", "iGOT Adapter")}: <strong className="text-on-surface">{igotStatus}</strong></span>
            </div>
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="glass-panel p-5 rounded-3xl border border-outline-variant/30">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("courses.searchPlaceholder", "Search courses by topic, title...")}
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-high/60 pl-10 pr-3 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="rounded-xl border border-outline-variant/40 bg-surface-container-high/60 px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">{t("courses.allProviders", "All Providers")}</option>
              <option value="igot">iGOT Karmayogi</option>
              <option value="nssta">NSSTA Academy</option>
              <option value="internal">MoSPI Internal</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-xl border border-outline-variant/40 bg-surface-container-high/60 px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">{t("courses.allLevels", "All Difficulty Levels")}</option>
              <option value="easy">{t("passport.level1", "Beginner / Foundational")}</option>
              <option value="medium">{t("passport.level2", "Intermediate")}</option>
              <option value="hard">{t("passport.level3", "Advanced / Specialized")}</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setProvider("");
                setDifficulty("");
              }}
              className="glow-button rounded-xl text-black font-bold text-xs font-label-caps uppercase tracking-wider px-4 py-2.5 shadow-md flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {t("courses.resetFilters", "Reset Filters")}
            </button>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-on-surface">
              {t("courses.availableModules", "Available Modules")} ({filteredCourses.length})
            </h2>
            <span className="text-xs font-label-caps text-on-surface-variant">
              {t("courses.mappedToStandards", "Mapped to DoPT / NCS Standards")}
            </span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-outline-variant/30 space-y-3">
              <BookOpen className="w-10 h-10 text-on-surface-variant/60 mx-auto" />
              <h3 className="font-display text-lg font-bold text-on-surface">
                {t("courses.noCoursesFound", "No matching courses found")}
              </h3>
              <p className="text-sm text-on-surface-variant">
                {t("courses.tryResetting", "Try resetting filters to explore the full catalogue.")}
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setProvider("");
                  setDifficulty("");
                }}
                className="glow-button-secondary inline-block px-5 py-2 rounded-full text-xs font-label-caps uppercase mt-2"
              >
                {t("courses.resetFilters", "Reset Filters")}
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => {
                const isIgot = course.provider === "igot";
                const isNssta = course.provider === "nssta";

                return (
                  <Link
                    href={`/courses/${course.id}`}
                    key={course.id}
                    className="glass-panel glass-panel-interactive p-7 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group space-y-5 hover:border-primary-container/40"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-label-caps uppercase font-bold tracking-wider ${
                            isIgot
                              ? "bg-secondary-container/10 text-secondary-fixed-dim border border-secondary-container/30"
                              : isNssta
                              ? "bg-tertiary-container/10 text-tertiary-fixed-dim border border-tertiary-container/30"
                              : "bg-surface-container-high text-on-surface-variant border border-outline-variant/30"
                          }`}
                        >
                          {course.provider.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-label-caps text-on-surface-variant px-2.5 py-0.5 rounded-md bg-surface-container-high">
                          {tEntity(course.difficulty)}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                          {tEntity(course.title)}
                        </h3>
                        <p className="mt-2 text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-outline-variant/20">
                      {/* Competencies badges */}
                      {course.competencies.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {course.competencies.slice(0, 3).map((comp) => (
                            <span
                              key={comp}
                              className="px-2 py-0.5 rounded-md bg-primary-container/10 text-primary-fixed-dim text-[10px] font-label-caps"
                            >
                              {tEntity(comp)}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="flex items-center gap-1.5 text-on-surface-variant font-label-caps text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          {course.durationHours} {t("courses.hours", "Hours")}
                        </span>

                        <span
                          className="glow-button-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
                        >
                          {t("courses.viewDetails", "View Details")}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
