"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, BookOpen } from "lucide-react";
import { getCourseThumbnail } from "@/lib/course-images";
import { EnrollButton } from "@/components/enroll-button";
import { useTranslation } from "@/components/language/language-provider";
import type { Course } from "@/types/domain";

export function CourseCatalogue({ initialCourses }: { initialCourses: Course[] }) {
  const { t, tEntity } = useTranslation();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || 
                            course.description.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficultyFilter === "all" || course.difficulty.toLowerCase() === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [initialCourses, search, difficultyFilter]);

  return (
    <div className="space-y-6 mt-8">
      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-24 z-20">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
          <input
            type="text"
            placeholder={t("courses.searchPlaceholder", "Search courses by title or description...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="auth-input w-full pl-12 pr-4 py-3 rounded-xl text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-on-surface-variant hidden sm:block" />
          <select 
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="auth-input rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer w-full sm:w-auto min-w-[150px]"
          >
            <option value="all">{t("courses.allDifficulties", "All Difficulties")}</option>
            <option value="beginner">{t("passport.level1", "Beginner")}</option>
            <option value="intermediate">{t("passport.level2", "Intermediate")}</option>
            <option value="advanced">{t("passport.level3", "Advanced")}</option>
          </select>
        </div>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between px-2 text-sm text-on-surface-variant">
        <p>
          {t("courses.showing", "Showing")} <strong className="text-on-surface">{filteredCourses.length}</strong> {t("nav.courses", "courses")}
        </p>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <article key={course.id} className="group glass-panel glass-panel-interactive rounded-2xl overflow-hidden flex flex-col h-full border border-white/5 hover:border-primary-container/40 transition-all">
              <Link href={`/learner/courses/${course.id}`} className="block h-48 relative overflow-hidden bg-surface-container-high shrink-0">
                <img
                  src={getCourseThumbnail(course.title)}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold font-label-caps text-white border border-white/10">
                  {course.provider.toUpperCase()}
                </div>
              </Link>

              <div className="p-6 flex flex-col flex-1">
                <Link href={`/learner/courses/${course.id}`}>
                  <h2 className="font-display text-xl text-on-surface font-bold leading-tight mb-3 group-hover:text-primary-container transition-colors line-clamp-2">
                    {tEntity(course.title)}
                  </h2>
                </Link>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1 line-clamp-3">
                  {tEntity(course.description)}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5 mb-6">
                   <span className="text-[10px] font-label-caps uppercase text-on-surface-variant bg-surface-container px-2 py-1 rounded border border-white/5">
                     {course.durationHours} {t("common.hrsTotal", "HRS")}
                   </span>
                   <span className="text-[10px] font-label-caps uppercase text-on-surface-variant bg-surface-container px-2 py-1 rounded border border-white/5">
                     {tEntity(course.difficulty)}
                   </span>
                   <span className="text-[10px] font-label-caps uppercase text-on-surface-variant bg-surface-container px-2 py-1 rounded border border-white/5">
                     {tEntity(course.language)}
                   </span>
                </div>
                
                <div className="mt-auto">
                  <EnrollButton courseId={course.id} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center border-dashed border-white/10">
          <BookOpen className="w-12 h-12 text-on-surface-variant/30 mb-4" />
          <h3 className="font-display text-xl font-bold text-on-surface mb-2">
            {t("courses.noCourses", "No courses found")}
          </h3>
          <p className="text-on-surface-variant max-w-md mx-auto">
            {t("courses.noCoursesDesc", "We couldn't find any courses matching your filter criteria. Try adjusting your search query.")}
          </p>
          <button 
            onClick={() => { setSearch(""); setDifficultyFilter("all"); }}
            className="mt-6 text-primary-container hover:text-primary-container/80 text-sm font-label-caps tracking-widest font-bold underline underline-offset-4"
          >
            {t("courses.clearFilters", "CLEAR FILTERS")}
          </button>
        </div>
      )}
    </div>
  );
}
