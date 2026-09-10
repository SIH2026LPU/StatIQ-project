import { db } from "@/db/store";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/enroll-button";
import { getCourseThumbnail } from "@/lib/course-images";
import { getCurriculumForCourse } from "@/lib/course-curriculum";
import { getSession } from "@/lib/auth/session";
import { ArrowLeft, CheckCircle2, Clock, BarChart, Globe, Award, Zap, PlayCircle, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;
  const course = db.getCourse(courseId);

  if (!course) {
    notFound();
  }

  const session = await getSession();
  const employee = session ? db.resolveEmployeeForSession(session) : null;
  const enrollments = employee ? db.listEnrollments(employee.id) : [];
  const isEnrolled = enrollments.some((e) => e.courseId === course.id);

  const curriculum = getCurriculumForCourse(course.title, course.provider, course.id);

  // Get competencies this course covers
  const courseComps = db.listCourseCompetencies().filter((c) => c.courseId === course.id);
  const compDetails = courseComps.map(cc => {
    const comp = db.getCompetency(cc.competencyId);
    return { ...cc, name: comp?.name || "Unknown", desc: comp?.description || "" };
  });

  return (
    <div className="space-y-8 animate-fade-up max-w-5xl mx-auto pb-16">
      <Link href="/learner/courses" className="inline-flex items-center gap-2 text-sm text-primary-container hover:underline font-label-caps tracking-widest">
        <ArrowLeft className="w-4 h-4" />
        BACK TO CATALOGUE
      </Link>

      {/* Hero Section */}
      <div className="glass-panel rounded-3xl overflow-hidden border-t-[3px] border-t-primary-container">
        <div className="h-64 sm:h-80 relative overflow-hidden bg-surface-container-high shrink-0">
          <img
            src={getCourseThumbnail(course.title)}
            alt={course.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="inline-block px-3 py-1.5 rounded-md bg-primary-container/20 backdrop-blur-md text-primary-container font-label-caps text-xs uppercase border border-primary-container/30 mb-4">
              {course.provider} PROVIDER
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight max-w-3xl">
              {course.title}
            </h1>
            <p className="mt-4 text-white/80 text-lg max-w-2xl leading-relaxed">
              {course.description}
            </p>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5 border-t border-white/5 bg-surface-container-low/50">
          <div className="p-4 md:p-6 flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary-container shrink-0" />
            <div>
              <div className="text-[10px] font-label-caps text-on-surface-variant">DURATION</div>
              <div className="font-bold text-on-surface">{course.durationHours} Hours</div>
            </div>
          </div>
          <div className="p-4 md:p-6 flex items-center gap-3">
            <BarChart className="w-5 h-5 text-primary-container shrink-0" />
            <div>
              <div className="text-[10px] font-label-caps text-on-surface-variant">LEVEL</div>
              <div className="font-bold text-on-surface capitalize">{course.difficulty}</div>
            </div>
          </div>
          <div className="p-4 md:p-6 flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary-container shrink-0" />
            <div>
              <div className="text-[10px] font-label-caps text-on-surface-variant">LANGUAGE</div>
              <div className="font-bold text-on-surface uppercase">{course.language}</div>
            </div>
          </div>
          <div className="p-4 md:p-6 flex items-center gap-3">
            <Award className="w-5 h-5 text-primary-container shrink-0" />
            <div>
              <div className="text-[10px] font-label-caps text-on-surface-variant">QUALITY SCORE</div>
              <div className="font-bold text-on-surface">{Math.round(course.qualityScore * 100)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Syllabus / Video Curriculum Preview */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-on-surface flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-container" />
                Course Curriculum & Video Lessons
              </h2>
              <span className="text-xs font-label-caps text-on-surface-variant">
                {curriculum.length} MODULES
              </span>
            </div>
            
            <div className="space-y-3 pt-2">
              {curriculum.map((mod, mIdx) => (
                <div key={mod.id} className="p-4 rounded-xl bg-surface-container border border-white/5 space-y-3 hover:border-primary-container/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container text-xs font-bold shrink-0">
                        {mIdx + 1}
                      </div>
                      <span className="text-sm font-bold text-on-surface">{mod.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-label-caps text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                        {mod.duration}
                      </span>
                      <Link
                        href={`/learner/courses/${course.id}/play`}
                        className="glow-button-secondary text-[10px] font-label-caps font-bold px-3 py-1 rounded-lg inline-flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-primary-container" />
                        WATCH VIDEO
                      </Link>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{mod.overview}</p>
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {mod.statements.map((st, stIdx) => (
                      <span key={stIdx} className="text-[11px] px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface-variant border border-white/5">
                        ✓ {st.slice(0, 75)}...
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary-container" />
              What you will learn
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-container shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Master the core concepts of <strong className="text-on-surface">{course.title.toLowerCase()}</strong> and apply them in real-world scenarios.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-container shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Understand the theoretical foundations outlined in {course.provider.toUpperCase()} documentation.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-container shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Gain hands-on experience through practical assessments and adaptive checking.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-container shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Bridge your identified competency gaps to achieve your target role readiness.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-6">
              Competencies Achieved
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Completing this course will directly increase your proficiency score in the following organizational competencies.
            </p>
            <div className="space-y-4">
              {compDetails.map((comp) => (
                <div key={comp.competencyId} className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-between group">
                  <div>
                    <h4 className="font-bold text-on-surface">{comp.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 max-w-md">{comp.desc}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-[10px] font-label-caps text-on-surface-variant mb-1">COVERAGE</div>
                    <div className="inline-flex items-center justify-center px-2 py-1 rounded bg-secondary-container/10 text-secondary-container font-bold text-sm border border-secondary-container/20">
                      +{Math.round(comp.coverage * 100)}%
                    </div>
                  </div>
                </div>
              ))}
              {compDetails.length === 0 && (
                <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 text-center text-sm text-on-surface-variant">
                  This course provides general knowledge without targeting specific competency frameworks.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 sticky top-24 border border-white/5 space-y-6">
            <div>
              <div className="text-[10px] font-label-caps text-on-surface-variant mb-2">COURSE STATUS</div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary-container text-xs font-bold font-label-caps">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                {isEnrolled ? "ENROLLED & ACTIVE" : "AVAILABLE FOR ENROLLMENT"}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                <span className="text-on-surface-variant">Delivery Mode</span>
                <span className="font-bold text-on-surface capitalize">{course.deliveryMode}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                <span className="text-on-surface-variant">Assessments</span>
                <span className="font-bold text-on-surface">Included</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                <span className="text-on-surface-variant">Certificate</span>
                <span className="font-bold text-on-surface">Yes (MoSPI Certified)</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href={`/learner/courses/${course.id}/play`}
                className="w-full glow-button inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-label-caps text-xs font-bold tracking-widest text-center shadow-[0_0_20px_rgba(57,255,20,0.25)]"
              >
                <PlayCircle className="w-4 h-4" />
                START / CONTINUE LEARNING
              </Link>

              {!isEnrolled && (
                <EnrollButton courseId={course.id} />
              )}
            </div>

            <p className="text-center text-[10px] text-on-surface-variant font-label-caps">
              VERIFIED OFFICIAL STATISTICAL SYLLABUS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

