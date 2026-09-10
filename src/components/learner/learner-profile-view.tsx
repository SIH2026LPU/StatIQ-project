"use client";

import { useTranslation } from "@/components/language/language-provider";
import { User, Target, Building2, Map, Shield, BadgeCheck, Mail } from "lucide-react";
import { ProfileEditor } from "@/components/profile/profile-editor";

interface LearnerProfileViewProps {
  employee: {
    id: string;
    name: string;
    designation: string | null;
    careerGoal?: string | null;
  };
  email?: string;
  snap: {
    readiness: number;
    department?: { name: string };
    targetRole?: { name: string };
    enrollments: Array<{ learningHours: number }>;
    categoryScores: Array<{ name: string }>;
  };
}

export function LearnerProfileView({ employee, email, snap }: LearnerProfileViewProps) {
  const { t, tEntity } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-up max-w-5xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <User className="w-4 h-4 text-primary-container" />
          {t("profile.badge", "LEARNER PROFILE")}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          {t("profile.title", "My Profile")}
        </h1>
      </header>

      {/* Profile Header Card */}
      <div className="glass-panel rounded-3xl p-8 md:p-10 border-t-[3px] border-t-primary-container relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BadgeCheck className="w-64 h-64 text-primary-container" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-32 h-32 rounded-full bg-surface-container-high border-4 border-primary-container/30 flex items-center justify-center font-display text-5xl font-bold text-on-surface shadow-[0_0_30px_rgba(57,255,20,0.15)]">
            {employee.name.charAt(0)}
          </div>
          
          <div className="flex-1 space-y-2">
            <h2 className="font-display text-3xl font-bold text-on-surface">{employee.name}</h2>
            <div className="flex flex-wrap gap-4 text-on-surface-variant font-medium">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary-container" />
                {tEntity(employee.designation)}
              </span>
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-secondary-container" />
                {tEntity(snap.department?.name)}
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-tertiary-container" />
                {email}
              </span>
            </div>
            {employee.careerGoal && (
              <p className="mt-4 text-on-surface-variant bg-surface-container-low px-4 py-3 rounded-xl border border-white/5 max-w-2xl">
                <strong className="text-on-surface block mb-1">{t("profile.careerGoal", "Career Goal")}:</strong>
                {tEntity(employee.careerGoal, employee.careerGoal)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Role & Readiness */}
        <div className="glass-panel rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Map className="w-6 h-6 text-primary-container" />
            <h3 className="font-display text-2xl font-bold text-on-surface">{t("profile.careerPath", "Career Path")}</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-label-caps text-on-surface-variant mb-2">{t("profile.currentDesignation", "CURRENT DESIGNATION")}</p>
              <p className="text-lg font-medium text-on-surface">{tEntity(employee.designation)}</p>
            </div>
            
            <div className="pl-4 border-l-2 border-primary-container/30 py-2">
              <p className="text-xs font-label-caps text-on-surface-variant mb-2">{t("profile.targetRole", "TARGET ROLE")}</p>
              <p className="text-xl font-bold text-primary-container">{tEntity(snap.targetRole?.name)}</p>
            </div>
            
            <div className="bg-surface-container rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <p className="font-medium text-on-surface">{t("profile.roleReadiness", "Target Role Readiness")}</p>
                <span className="font-display font-bold text-2xl text-primary-container">{snap.readiness.toFixed(0)}%</span>
              </div>
              <div className="h-3 rounded-full bg-surface-container-highest overflow-hidden" dir="ltr">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary-container/60 to-primary-container transition-all" 
                  style={{ width: `${snap.readiness}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="glass-panel rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Shield className="w-6 h-6 text-secondary-container" />
            <h3 className="font-display text-2xl font-bold text-on-surface">{t("profile.accountDetails", "Account Details")}</h3>
          </div>
          
          <ul className="space-y-4">
            <li className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-on-surface-variant">{t("common.status", "Account Status")}</span>
              <span className="px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/30 text-xs font-label-caps text-primary-container">{t("common.active", "ACTIVE")}</span>
            </li>
            <li className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-on-surface-variant">{t("profile.department", "Department")}</span>
              <span className="text-on-surface font-medium">{tEntity(snap.department?.name)}</span>
            </li>
            <li className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-on-surface-variant">{t("common.learningHours", "Total Learning Hours")}</span>
              <span className="text-on-surface font-medium">{snap.enrollments.reduce((s, e) => s + e.learningHours, 0)} {t("common.hrsTotal", "hrs")}</span>
            </li>
            <li className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-on-surface-variant">{t("passport.verifiedSkills", "Competencies Tracked")}</span>
              <span className="text-on-surface font-medium">{snap.categoryScores.length} {t("common.domain", "Domains")}</span>
            </li>
          </ul>
        </div>
      </div>

      <ProfileEditor currentEmail={email || ""} />
    </div>
  );
}
