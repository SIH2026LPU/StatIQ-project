import { db } from "@/db/store";
import { getIGOTProvider } from "@/lib/integrations/igot";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Clock,
  Award,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Courses & Training Catalogue — StatIQ AI",
  description: "Explore curated official statistics courses aligned to iGOT Karmayogi and NSSTA competency frameworks.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; provider?: string; difficulty?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").toLowerCase();
  const igotStatus = getIGOTProvider().status();
  const courses = db.listCourses().filter((course) => {
    const text = `${course.title} ${course.description}`.toLowerCase();
    const matchQ = !q || text.includes(q);
    const matchP = !params.provider || course.provider === params.provider;
    const matchD = !params.difficulty || course.difficulty === params.difficulty;
    return matchQ && matchP && matchD;
  });
  const mappings = db.listCourseCompetencies();
  const competencies = db.listCompetencies();

  return (
    <>
      <div className="mesh-bg" />
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[85vh] space-y-12">
        {/* Hero Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary-fixed-dim font-label-caps text-xs">
            <BookOpen className="w-3.5 h-3.5 text-primary-container" />
            COMPETENCY-ALIGNED LEARNING CATALOGUE
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                Courses & Skill Pathways
              </h1>
              <p className="mt-3 text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Explore statistical training curricula from iGOT Karmayogi, National Statistical Systems Training Academy (NSSTA), and internal MoSPI modules.
              </p>
            </div>

            <div className="glass-panel px-4 py-2.5 rounded-2xl border border-outline-variant/30 flex items-center gap-2 text-xs font-label-caps text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>iGOT Adapter: <strong className="text-on-surface">{igotStatus}</strong></span>
            </div>
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="glass-panel p-5 rounded-3xl border border-outline-variant/30">
          <form className="grid gap-3 md:grid-cols-4" method="get">
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Search courses by topic, title..."
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-high/60 pl-10 pr-3 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <select
              name="provider"
              defaultValue={params.provider ?? ""}
              className="rounded-xl border border-outline-variant/40 bg-surface-container-high/60 px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">All Providers</option>
              <option value="igot">iGOT Karmayogi</option>
              <option value="nssta">NSSTA Academy</option>
              <option value="internal">MoSPI Internal</option>
            </select>

            <select
              name="difficulty"
              defaultValue={params.difficulty ?? ""}
              className="rounded-xl border border-outline-variant/40 bg-surface-container-high/60 px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">All Difficulty Levels</option>
              <option value="easy">Beginner / Foundational</option>
              <option value="medium">Intermediate</option>
              <option value="hard">Advanced / Specialized</option>
            </select>

            <button className="glow-button rounded-xl text-black font-bold text-xs font-label-caps uppercase tracking-wider px-4 py-2.5 shadow-md flex items-center justify-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter Courses
            </button>
          </form>
        </section>

        {/* Courses Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-on-surface">Available Modules ({courses.length})</h2>
            <span className="text-xs font-label-caps text-on-surface-variant">Mapped to DoPT / NCS Standards</span>
          </div>

          {courses.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-outline-variant/30 space-y-3">
              <BookOpen className="w-10 h-10 text-on-surface-variant/60 mx-auto" />
              <h3 className="font-display text-lg font-bold text-on-surface">No matching courses found</h3>
              <p className="text-sm text-on-surface-variant">Try resetting filters to explore the full catalogue.</p>
              <Link href="/courses" className="glow-button-secondary inline-block px-5 py-2 rounded-full text-xs font-label-caps uppercase mt-2">
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const comps = mappings
                  .filter((m) => m.courseId === course.id)
                  .map((m) => competencies.find((c) => c.id === m.competencyId)?.name)
                  .filter(Boolean);

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
                          {course.difficulty}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                          {course.title}
                        </h3>
                        <p className="mt-2 text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-outline-variant/20">
                      {/* Competencies badges */}
                      {comps.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {comps.slice(0, 3).map((comp) => (
                            <span key={comp} className="px-2 py-0.5 rounded-md bg-primary-container/10 text-primary-fixed-dim text-[10px] font-label-caps">
                              {comp}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="flex items-center gap-1.5 text-on-surface-variant font-label-caps text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          {course.durationHours} Hours
                        </span>

                        <span
                          className="glow-button-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
                        >
                          View Details
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
