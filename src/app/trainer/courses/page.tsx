import { db } from "@/db/store";
import { Notice } from "@/components/app-shell";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Layers,
  Award,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
  X,
} from "lucide-react";

export default async function TrainerCourses({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = (resolvedSearchParams.q || "").toLowerCase().trim();

  const allCourses = db.listCourses();
  const maps = db.listCourseCompetencies();
  const documents = db.listDocuments();

  const courses = query
    ? allCourses.filter((c) => {
        const titleMatch = c.title.toLowerCase().includes(query);
        const descMatch = c.description.toLowerCase().includes(query);
        const compMatches = maps
          .filter((m) => m.courseId === c.id)
          .some((m) => {
            const comp = db.getCompetency(m.competencyId);
            return comp?.name.toLowerCase().includes(query);
          });
        return titleMatch || descMatch || compMatches;
      })
    : allCourses;

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-outline-variant/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-xs text-primary-container">
            <BookOpen className="w-3.5 h-3.5" />
            CURRICULUM MANAGEMENT & RAG REPOSITORY
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Course Builder & Catalog
          </h1>
          <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
            Curate statistical training modules, map competencies to official DoPT standards, and index training materials for AI retrieval-augmented grounding.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/courses"
            className="glow-button-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
          >
            <Layers className="w-4 h-4" />
            Public View
          </Link>
          <button
            type="button"
            className="glow-button inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add New Course
          </button>
        </div>
      </header>

      {/* Filter / Search Bar */}
      {query && (
        <div className="p-4 rounded-2xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-label-caps text-primary-container font-bold">
              FILTERED BY GAP / KEYWORD:
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-primary-container/20 text-on-surface text-xs font-semibold">
              &ldquo;{query}&rdquo;
            </span>
          </div>
          <Link
            href="/trainer/courses"
            className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-white font-label-caps"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filter
          </Link>
        </div>
      )}

      {/* Course Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">
              Mapped Courses ({courses.length})
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Modules actively recommended in learner skill gap pathways
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-outline-variant/30 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-on-surface-variant/60 mx-auto" />
            <h4 className="font-display text-base font-bold text-on-surface">
              No courses matching &ldquo;{query}&rdquo;
            </h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Try searching with another competency keyword or clear the active filter.
            </p>
            <Link
              href="/trainer/courses"
              className="glow-button inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-label-caps uppercase font-bold text-black mt-2"
            >
              View All Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => {
              const mappedCompetencies = maps
                .filter((m) => m.courseId === course.id)
                .map((m) => db.getCompetency(m.competencyId)?.name)
                .filter(Boolean);

              const isIgot = course.provider === "igot";

              return (
                <div
                  key={course.id}
                  className="glass-panel glass-panel-interactive p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between space-y-4 hover:border-primary-container/40"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-label-caps uppercase font-bold tracking-wider ${
                          isIgot
                            ? "bg-secondary-container/10 text-secondary-fixed-dim border border-secondary-container/30"
                            : "bg-tertiary-container/10 text-tertiary-fixed-dim border border-tertiary-container/30"
                        }`}
                      >
                        {course.provider.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-label-caps text-on-surface-variant px-2.5 py-0.5 rounded-md bg-surface-container-high">
                        {course.difficulty} · {course.durationHours}h
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-bold text-on-surface leading-snug">
                        {course.title}
                      </h3>
                      <p className="mt-2 text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-outline-variant/20">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-wider block">
                        Mapped Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {mappedCompetencies.length === 0 ? (
                          <span className="text-xs text-on-surface-variant/60">—</span>
                        ) : (
                          mappedCompetencies.map((name) => (
                            <span
                              key={name}
                              className="px-2 py-0.5 rounded-md bg-primary-container/10 text-primary-fixed-dim text-[10px] font-label-caps"
                            >
                              {name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] font-mono text-on-surface-variant">ID: {course.id}</span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/learner/courses/${course.id}`}
                          className="glow-button-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
                        >
                          View Curriculum
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <a
                          href={course.sourceUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-high text-xs font-label-caps text-on-surface transition-colors inline-flex items-center gap-1"
                        >
                          Source
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Indexed RAG Documents Section */}
      <section className="glass-panel p-6 md:p-8 rounded-3xl border border-outline-variant/30 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-on-surface">
                Indexed Training Materials (RAG Knowledge Base)
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Official PDF guidelines, NSSTA manuals, and MoSPI statistical standards indexed for AI Tutor and Quiz generation.
            </p>
          </div>
          <button
            type="button"
            className="glow-button-secondary px-4 py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
          >
            Upload Document
          </button>
        </div>

        <div className="divide-y divide-outline-variant/15">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 px-4 -mx-4 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{doc.title}</p>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                    {doc.mimeType || "application/pdf"} · ID: {doc.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-label-caps uppercase font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  {doc.status || "Indexed"}
                </span>
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg border border-outline-variant/40 hover:bg-surface-container-high text-xs font-label-caps text-on-surface transition-colors"
                >
                  View Embeddings
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
