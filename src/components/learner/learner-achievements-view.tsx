"use client";

import { useTranslation } from "@/components/language/language-provider";
import { Award, Trophy, Star, Medal, GraduationCap } from "lucide-react";

interface CompletedCourseItem {
  id: string;
  completedAt?: string;
  course?: {
    id: string;
    title: string;
  };
}

interface LearnerAchievementsViewProps {
  employeeName: string;
  completedCourses: CompletedCourseItem[];
}

export function LearnerAchievementsView({
  employeeName,
  completedCourses,
}: LearnerAchievementsViewProps) {
  const { t, tEntity } = useTranslation();

  const mockBadges = [
    { id: 1, titleKey: "achievements.fastLearner", title: "Fast Learner", descKey: "achievements.fastLearnerDesc", description: "Completed 3 courses in one week", icon: Star, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" },
    { id: 2, titleKey: "achievements.sqlMaster", title: "SQL Master", descKey: "achievements.sqlMasterDesc", description: "Scored 100% in SQL Assessment", icon: Trophy, color: "text-primary-container", bg: "bg-primary-container/10", border: "border-primary-container/30" },
    { id: 3, titleKey: "achievements.consistent", title: "Consistent", descKey: "achievements.consistentDesc", description: "Logged in for 7 consecutive days", icon: Medal, color: "text-secondary-container", bg: "bg-secondary-container/10", border: "border-secondary-container/30" },
  ];

  return (
    <div className="space-y-12 animate-fade-up max-w-6xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <Award className="w-4 h-4 text-primary-container" />
          {t("achievements.badge", "YOUR REWARDS")}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          {t("achievements.title", "Achievements & Certificates")}
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          {t("achievements.subtitle", "View your earned certificates and gamification badges for hitting major learning milestones.")}
        </p>
      </header>

      {/* Badges Section */}
      <section>
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          {t("achievements.badgesTitle", "Badges & Milestones")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {mockBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.id} className={`glass-panel p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300`}>
                <div className={`w-20 h-20 rounded-full ${badge.bg} ${badge.border} border-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className={`w-10 h-10 ${badge.color}`} />
                </div>
                <h3 className="font-display text-xl font-bold text-on-surface mb-2">{t(badge.titleKey, badge.title)}</h3>
                <p className="text-sm text-on-surface-variant">{t(badge.descKey, badge.description)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Certificates Section */}
      <section>
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-secondary-container" />
          {t("achievements.certificatesTitle", "Course Certificates")}
        </h2>
        
        {completedCourses.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {completedCourses.map((enrollment) => (
              <div key={enrollment.id} className="glass-panel p-1 rounded-3xl overflow-hidden gradient-border">
                <div className="bg-surface-container-lowest p-8 rounded-[22px] h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Award className="w-48 h-48 text-primary-container" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-xs font-label-caps tracking-widest text-on-surface-variant mb-1">
                          {t("achievements.certificateOfCompletion", "CERTIFICATE OF COMPLETION")}
                        </p>
                        <p className="text-[10px] text-on-surface-variant/70 uppercase">
                          {t("achievements.issuedOn", "ISSUED ON")}: {enrollment.completedAt?.split('T')[0] || "2026-09-10"}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-black" />
                      </div>
                    </div>
                    
                    <h3 className="font-display text-3xl font-bold text-on-surface leading-tight mb-4 flex-1">
                      {tEntity(enrollment.course?.title)}
                    </h3>
                    
                    <p className="text-on-surface-variant text-sm mb-8 max-w-md">
                      {t("achievements.certifies", "This certifies that the learner has successfully completed the curriculum and demonstrated proficiency in the subject matter.")}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto text-xs text-on-surface-variant font-label-caps">
                      <span>StatIQ AI Accredited</span>
                      <span>Verified Digital Record</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center border border-dashed border-white/10">
            <Award className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              {t("achievements.title", "No certificates yet")}
            </h3>
            <p className="text-on-surface-variant text-sm">
              {t("achievements.subtitle", "Complete courses to earn official MoSPI-aligned verifiable digital certificates.")}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
