import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { redirect } from "next/navigation";
import { Award, Trophy, Star, Download, Medal, GraduationCap, ExternalLink, Share2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");

  const employee = db.getEmployee(session.employeeId);
  
  const snap = learnerSnapshot(employee);
  const completedCourses = snap.enrollments.filter(e => e.status === "completed").map(e => ({
    ...e,
    course: db.getCourse(e.courseId)
  }));

  const mockBadges = [
    { id: 1, title: "Fast Learner", description: "Completed 3 courses in one week", icon: Star, color: "text-saffron", bg: "bg-saffron/10", border: "border-saffron/30" },
    { id: 2, title: "SQL Master", description: "Scored 100% in SQL Assessment", icon: Trophy, color: "text-primary-container", bg: "bg-primary-container/10", border: "border-primary-container/30" },
    { id: 3, title: "Consistent", description: "Logged in for 7 consecutive days", icon: Medal, color: "text-secondary-container", bg: "bg-secondary-container/10", border: "border-secondary-container/30" },
  ];

  return (
    <div className="space-y-12 animate-fade-up max-w-6xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <Award className="w-4 h-4 text-primary-container" />
          YOUR REWARDS
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          Achievements & Certificates
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          View your earned certificates and gamification badges for hitting major learning milestones.
        </p>
      </header>

      {/* Badges Section */}
      <section>
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-saffron" />
          Badges & Milestones
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {mockBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.id} className={`glass-panel p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300`}>
                <div className={`w-20 h-20 rounded-full ${badge.bg} ${badge.border} border-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className={`w-10 h-10 ${badge.color}`} />
                </div>
                <h3 className="font-display text-xl font-bold text-on-surface mb-2">{badge.title}</h3>
                <p className="text-sm text-on-surface-variant">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Certificates Section */}
      <section>
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-secondary-container" />
          Course Certificates
        </h2>
        
        {completedCourses.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {completedCourses.map((enrollment) => (
              <div key={enrollment.id} className="glass-panel p-1 rounded-3xl overflow-hidden gradient-border">
                <div className="bg-surface-container-lowest p-8 rounded-[22px] h-full flex flex-col relative overflow-hidden">
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Award className="w-48 h-48 text-primary-container" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-xs font-label-caps tracking-widest text-on-surface-variant mb-1">CERTIFICATE OF COMPLETION</p>
                        <p className="text-[10px] text-on-surface-variant/70 uppercase">ISSUED ON: {enrollment.completedAt?.split('T')[0]}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-black" />
                      </div>
                    </div>
                    
                    <h3 className="font-display text-3xl font-bold text-on-surface leading-tight mb-4 flex-1">
                      {enrollment.course?.title}
                    </h3>
                    
                    <p className="text-on-surface-variant text-sm mb-8 max-w-md">
                      This certifies that <strong className="text-on-surface">{employee.name}</strong> has successfully completed the curriculum and demonstrated proficiency in the subject matter.
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                      <div>
                        <p className="text-[10px] font-label-caps text-on-surface-variant/70">VERIFICATION ID</p>
                        <p className="text-xs font-mono text-on-surface mt-0.5">{enrollment.id.split('-').pop()?.toUpperCase()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-full border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors" title="Share to LinkedIn">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-full border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors" title="Verify Certificate">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="glow-button-secondary px-4 py-2 rounded-full font-label-caps tracking-widest text-[10px] font-bold flex items-center gap-2 hover:bg-primary-container/10 transition-colors ml-2">
                          <Download className="w-3 h-3" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center border-dashed border-white/10">
            <GraduationCap className="w-16 h-16 text-on-surface-variant/30 mb-4" />
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">No certificates yet</h3>
            <p className="text-on-surface-variant max-w-md">
              Complete your first course to earn a certificate of completion. Browse the course catalogue to get started!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
