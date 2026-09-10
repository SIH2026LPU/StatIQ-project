import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { redirect } from "next/navigation";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { Users, BookOpen, TrendingUp, MessageSquare } from "lucide-react";
import { CommunityClient } from "@/components/community-client";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");

  const employee = db.getEmployee(session.employeeId);

  const snap = learnerSnapshot(employee);

  // Aggregate department stats — no individual identification
  const deptEmployees = db.listEmployees().filter((e) => e.departmentId === employee.departmentId);
  const deptEnrollments = deptEmployees.flatMap((e) => db.listEnrollments(e.id));
  const deptCompletions = deptEnrollments.filter((e) => e.status === "completed");

  // Course-level cohort stats (how many enrolled, completion rate)
  const courses = db.listCourses();
  const courseStats = courses.map((course) => {
    const enrolled = db.listEnrollments().filter((e) => e.courseId === course.id);
    const completed = enrolled.filter((e) => e.status === "completed");
    return {
      courseId: course.id,
      title: course.title,
      provider: course.provider,
      enrolledCount: enrolled.length,
      completedCount: completed.length,
      completionRate: enrolled.length > 0 ? Math.round((completed.length / enrolled.length) * 100) : 0,
    };
  }).filter((c) => c.enrolledCount > 0).sort((a, b) => b.enrolledCount - a.enrolledCount).slice(0, 6);

  // Learner's own enrolled courses for discussion access
  const myEnrollments = snap.enrollments.map((e) => e.courseId);

  const department = db.getDepartment(employee.departmentId);

  return (
    <div className="space-y-10 animate-fade-up max-w-5xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-container/30 bg-secondary-container/10 font-label-caps text-label-caps text-secondary-container">
          <Users className="w-4 h-4" />
          DEPARTMENT COMMUNITY
        </div>
        <h1 className="font-display text-4xl font-bold text-on-surface">Learning Community</h1>
        <p className="text-on-surface-variant max-w-2xl">
          Aggregate learning activity across <strong className="text-on-surface">{department?.name ?? "your department"}</strong>.
          Stats are anonymised — no individual comparison without opt-in.
        </p>
      </header>

      {/* Dept summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/5 text-center">
          <p className="font-display text-3xl font-bold text-primary-container">{deptEmployees.length}</p>
          <p className="text-xs font-label-caps text-on-surface-variant mt-1">TEAM MEMBERS</p>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/5 text-center">
          <p className="font-display text-3xl font-bold text-secondary-container">{deptEnrollments.length}</p>
          <p className="text-xs font-label-caps text-on-surface-variant mt-1">TOTAL ENROLLMENTS</p>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/5 text-center">
          <p className="font-display text-3xl font-bold text-emerald-400">{deptCompletions.length}</p>
          <p className="text-xs font-label-caps text-on-surface-variant mt-1">COMPLETIONS</p>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/5 text-center">
          <p className="font-display text-3xl font-bold text-amber-400">
            {deptEnrollments.length > 0 ? Math.round((deptCompletions.length / deptEnrollments.length) * 100) : 0}%
          </p>
          <p className="text-xs font-label-caps text-on-surface-variant mt-1">COMPLETION RATE</p>
        </div>
      </div>

      {/* Course activity leaderboard */}
      <section>
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-container" />
          Most Active Courses
        </h2>
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left font-label-caps text-on-surface-variant tracking-widest">Course</th>
                  <th className="px-6 py-4 text-left font-label-caps text-on-surface-variant tracking-widest">Provider</th>
                  <th className="px-6 py-4 text-right font-label-caps text-on-surface-variant tracking-widest">Enrolled</th>
                  <th className="px-6 py-4 text-right font-label-caps text-on-surface-variant tracking-widest">Completed</th>
                  <th className="px-6 py-4 text-right font-label-caps text-on-surface-variant tracking-widest">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courseStats.map((cs, i) => (
                  <tr key={cs.courseId} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 font-medium text-on-surface">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-xs text-on-surface-variant font-bold">{i + 1}</span>
                        {cs.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-surface-container-low border border-white/5 text-[10px] font-label-caps text-on-surface-variant uppercase">
                        {cs.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-on-surface">{cs.enrolledCount}</td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-bold">{cs.completedCount}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-primary-container rounded-full" style={{ width: `${cs.completionRate}%` }} />
                        </div>
                        <span className="text-on-surface-variant text-xs">{cs.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Discussion threads — scoped to enrolled courses */}
      <section>
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-secondary-container" />
          Course Discussions
          <span className="text-xs font-normal text-on-surface-variant ml-2">(your enrolled courses only)</span>
        </h2>
        <CommunityClient enrolledCourseIds={myEnrollments} courses={courseStats} employeeId={employee.id} employeeName={employee.name} />
      </section>
    </div>
  );
}
