"use client";

import { useTranslation } from "@/components/language/language-provider";
import { Users, TrendingUp, MessageSquare } from "lucide-react";
import { CommunityClient } from "@/components/community-client";

interface CourseStat {
  courseId: string;
  title: string;
  provider: string;
  enrolledCount: number;
  completedCount: number;
  completionRate: number;
}

export function LearnerCommunityView({
  departmentName,
  teamMembersCount,
  totalEnrollmentsCount,
  completionsCount,
  completionRate,
  courseStats,
  myEnrollments,
  employeeId,
  employeeName,
}: {
  departmentName: string;
  teamMembersCount: number;
  totalEnrollmentsCount: number;
  completionsCount: number;
  completionRate: number;
  courseStats: CourseStat[];
  myEnrollments: string[];
  employeeId: string;
  employeeName: string;
}) {
  const { t, tEntity } = useTranslation();

  return (
    <div className="space-y-10 animate-fade-up max-w-5xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-container/30 bg-secondary-container/10 font-label-caps text-label-caps text-secondary-container">
          <Users className="w-4 h-4" />
          {t("community.badge", "DEPARTMENT COMMUNITY")}
        </div>
        <h1 className="font-display text-4xl font-bold text-on-surface">
          {t("community.title", "Learning Community")}
        </h1>
        <p className="text-on-surface-variant max-w-2xl">
          {t("community.subtitle", "Aggregate learning activity across")} <strong className="text-on-surface">{tEntity(departmentName)}</strong>.
        </p>
      </header>

      {/* Dept summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/5 text-center">
          <p className="font-display text-3xl font-bold text-primary-container">{teamMembersCount}</p>
          <p className="text-xs font-label-caps text-on-surface-variant mt-1">
            {t("community.teamMembers", "TEAM MEMBERS")}
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/5 text-center">
          <p className="font-display text-3xl font-bold text-secondary-container">{totalEnrollmentsCount}</p>
          <p className="text-xs font-label-caps text-on-surface-variant mt-1">
            {t("community.totalEnrollments", "TOTAL ENROLLMENTS")}
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/5 text-center">
          <p className="font-display text-3xl font-bold text-emerald-400">{completionsCount}</p>
          <p className="text-xs font-label-caps text-on-surface-variant mt-1">
            {t("common.completed", "COMPLETIONS")}
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/5 text-center">
          <p className="font-display text-3xl font-bold text-amber-400">
            {completionRate}%
          </p>
          <p className="text-xs font-label-caps text-on-surface-variant mt-1">
            {t("community.completionRate", "COMPLETION RATE")}
          </p>
        </div>
      </div>

      {/* Course activity leaderboard */}
      <section>
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-container" />
          {t("community.mostActiveCourses", "Most Active Courses")}
        </h2>
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left font-label-caps text-on-surface-variant tracking-widest">
                    {t("nav.courses", "Course")}
                  </th>
                  <th className="px-6 py-4 text-left font-label-caps text-on-surface-variant tracking-widest">
                    {t("path.provider", "Provider")}
                  </th>
                  <th className="px-6 py-4 text-right font-label-caps text-on-surface-variant tracking-widest">
                    {t("learner.enrolledCourses", "Enrolled")}
                  </th>
                  <th className="px-6 py-4 text-right font-label-caps text-on-surface-variant tracking-widest">
                    {t("common.completed", "Completed")}
                  </th>
                  <th className="px-6 py-4 text-right font-label-caps text-on-surface-variant tracking-widest">
                    {t("community.rate", "Rate")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courseStats.map((cs, i) => (
                  <tr key={cs.courseId} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 font-medium text-on-surface">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-xs text-on-surface-variant font-bold">{i + 1}</span>
                        {tEntity(cs.title)}
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
          {t("community.discussions", "Course Discussions")}
        </h2>
        <CommunityClient enrolledCourseIds={myEnrollments} courses={courseStats} employeeId={employeeId} employeeName={employeeName} />
      </section>
    </div>
  );
}
