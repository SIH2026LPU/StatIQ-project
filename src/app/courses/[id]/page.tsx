import { notFound } from "next/navigation";
import { db } from "@/db/store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getSession } from "@/lib/auth/session";
import { SmartEnrollButton } from "@/components/smart-enroll-button";
import {
  BookOpen,
  Clock,
  Target,
  GraduationCap,
  Layers,
  CheckCircle2,
  List,
} from "lucide-react";

export const metadata = {
  title: "Course Details — StatIQ AI",
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = db.getCourse(id);

  if (!course) {
    notFound();
  }

  const session = await getSession();
  
  // Check if enrolled if logged in
  let isEnrolled = false;
  if (session?.employeeId) {
    const enrollments = db.listEnrollments(session.employeeId);
    isEnrolled = enrollments.some((e) => e.courseId === course.id);
  }

  // Get competencies
  const mappings = db.listCourseCompetencies().filter((m) => m.courseId === course.id);
  const competencies = db.listCompetencies();
  const comps = mappings
    .map((m) => competencies.find((c) => c.id === m.competencyId)?.name)
    .filter(Boolean);

  const isIgot = course.provider === "igot";
  const isNssta = course.provider === "nssta";

  return (
    <>
      <div className="mesh-bg" />
      <Navbar />

      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-[85vh]">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-8">
          <a href="/courses" className="text-on-surface-variant hover:text-on-surface font-label-caps text-xs tracking-wider transition-colors inline-flex items-center gap-2">
            <span>&larr;</span> BACK TO CATALOGUE
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              {/* Header Badges */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-label-caps uppercase font-bold tracking-wider ${
                    isIgot
                      ? "bg-secondary-container/10 text-secondary-fixed-dim border border-secondary-container/30"
                      : isNssta
                      ? "bg-tertiary-container/10 text-tertiary-fixed-dim border border-tertiary-container/30"
                      : "bg-surface-container-high text-on-surface-variant border border-outline-variant/30"
                  }`}
                >
                  {course.provider.toUpperCase()}
                </span>
                <span className="text-xs font-label-caps text-on-surface-variant px-3 py-1 rounded-md bg-surface-container-high">
                  {course.difficulty}
                </span>
              </div>

              {/* Title & Description */}
              <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight leading-tight">
                {course.title}
              </h1>
              
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-3xl">
                {course.description}
              </p>
            </div>

            {/* Competencies Section */}
            {comps.length > 0 && (
              <div className="glass-panel p-8 rounded-3xl border border-outline-variant/30 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-primary-container" />
                  <h3 className="font-display text-xl font-bold text-on-surface">Target Competencies</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comps.map((comp) => (
                    <div key={comp} className="flex items-start gap-3 bg-surface-container-low p-4 rounded-xl border border-white/5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-sm font-medium text-on-surface">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum / Structure */}
            <div className="glass-panel p-8 rounded-3xl border border-outline-variant/30 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <List className="w-6 h-6 text-primary-container" />
                <h3 className="font-display text-xl font-bold text-on-surface">Course Structure</h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                This module follows a structured competency-based curriculum covering key statistical methods, practical exercises, and standardized assessment criteria. Detailed curriculum and learning units are provided upon enrollment.
              </p>
            </div>
            
          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-6">
            
            <div className="glass-panel p-8 rounded-3xl border border-outline-variant/30 space-y-6 sticky top-32">
              
              {/* Course Meta Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <span className="text-on-surface-variant flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" /> Duration
                  </span>
                  <span className="text-on-surface font-bold">{course.durationHours} Hours</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <span className="text-on-surface-variant flex items-center gap-2 text-sm">
                    <Layers className="w-4 h-4" /> Format
                  </span>
                  <span className="text-on-surface font-bold">Online</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <span className="text-on-surface-variant flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4" /> Certification
                  </span>
                  <span className="text-on-surface font-bold">Yes</span>
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-4">
                <SmartEnrollButton 
                  courseId={course.id}
                  provider={course.provider}
                  sourceUrl={course.sourceUrl}
                  session={session}
                  isEnrolled={isEnrolled}
                />
              </div>
              
              {/* Disclaimer for external courses */}
              {(isIgot || isNssta) && (
                <p className="text-center text-xs text-on-surface-variant/60 font-label-caps mt-4">
                  Enrollment managed securely via {isIgot ? "iGOT Karmayogi" : "NSSTA"}
                </p>
              )}
              
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </>
  );
}
