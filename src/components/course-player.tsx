"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  PlayCircle, 
  CheckCircle2, 
  ChevronLeft, 
  Award, 
  Play, 
  Pause, 
  FileText, 
  CheckCircle, 
  BookOpen, 
  Sparkles
} from "lucide-react";
import type { Course } from "@/types/domain";
import { getCurriculumForCourse } from "@/lib/course-curriculum";
import { useTranslation } from "@/components/language/language-provider";

export function CoursePlayer({ course }: { course: Course }) {
  const { t, tEntity } = useTranslation();
  const modules = getCurriculumForCourse(course.title, course.provider);

  const [activeModuleId, setActiveModuleId] = useState(modules[0]?.id || "mod-1");
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"statements" | "notes" | "takeaways">("statements");
  const [userNotes, setUserNotes] = useState<string>("");

  const activeModule = modules.find(m => m.id === activeModuleId) || modules[0];
  const activeIndex = modules.findIndex(m => m.id === activeModuleId);
  const isComplete = completedModules.includes(activeModuleId);
  const courseComplete = completedModules.length === modules.length;

  const toggleComplete = () => {
    if (isComplete) {
      setCompletedModules(prev => prev.filter(id => id !== activeModuleId));
    } else {
      setCompletedModules(prev => [...prev, activeModuleId]);
      // Auto-advance to next module if available
      if (activeIndex < modules.length - 1) {
        setActiveModuleId(modules[activeIndex + 1].id);
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-up">
      <div className="flex items-center justify-between">
        <Link 
          href={`/learner/courses/${course.id}`} 
          className="inline-flex items-center gap-2 text-xs font-label-caps text-on-surface-variant hover:text-primary-container transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("courses.backToOverview", "BACK TO COURSE OVERVIEW")}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-label-caps text-on-surface-variant">
            {t("courses.completion", "COURSE COMPLETION")}
          </span>
          <span className="text-sm font-bold text-primary-container">
            {Math.round((completedModules.length / modules.length) * 100)}%
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Video & Lesson Content */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Video Container */}
          <div className="glass-panel rounded-3xl overflow-hidden border-t-[3px] border-t-primary-container shadow-2xl relative">
            <div className="bg-black aspect-video relative flex items-center justify-center overflow-hidden">
              
              {/* Sunbird Content Provenance Header */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                <span className="text-[11px] font-label-caps text-white font-medium">
                  {course.provider.toUpperCase()} SUNBIRD STREAM
                </span>
                {activeModule.sunbirdContentId && (
                  <span className="text-[9px] font-mono text-primary-container/80 pl-1 border-l border-white/20">
                    {activeModule.sunbirdContentId}
                  </span>
                )}
              </div>

              {/* Quality & Resolution Tag */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                <span className="text-[10px] font-label-caps text-primary-container font-bold">1080p HD</span>
                <span className="text-[9px] font-label-caps text-on-surface-variant">AUTO</span>
              </div>

              {courseComplete ? (
                <div className="relative z-10 flex flex-col items-center p-8 text-center animate-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-primary-container/20 border-2 border-primary-container flex items-center justify-center text-primary-container mb-4 shadow-[0_0_30px_rgba(57,255,20,0.3)]">
                    <Award className="w-10 h-10" />
                  </div>
                  <h2 className="font-display text-3xl font-bold text-white mb-2">
                    {t("courses.curriculumComplete", "Curriculum Complete!")}
                  </h2>
                  <p className="text-on-surface-variant max-w-md text-sm">
                    {t("courses.curriculumCompleteDesc", "You have successfully completed all verified lessons for")} {tEntity(course.title)}.
                  </p>
                  <Link 
                    href="/learner/achievements" 
                    className="mt-6 glow-button px-8 py-3 rounded-full font-label-caps tracking-widest text-xs font-bold text-black"
                  >
                    {t("courses.viewCertificate", "VIEW VERIFIED CERTIFICATE")}
                  </Link>
                </div>
              ) : isPlaying ? (
                <div className="w-full h-full relative z-10">
                  <iframe
                    src={`${activeModule.videoUrl}${activeModule.videoUrl.includes("?") ? "&" : "?"}autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                    title={activeModule.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center group cursor-pointer" onClick={() => setIsPlaying(true)}>
                  {/* Background Backdrop with Gradient */}
                  <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  {/* Center Play Button */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <button 
                      type="button"
                      className="w-20 h-20 rounded-full bg-primary-container/20 border-2 border-primary-container flex items-center justify-center text-primary-container backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-primary-container group-hover:text-black shadow-[0_0_35px_rgba(57,255,20,0.35)]"
                    >
                      <Play className="w-8 h-8 ml-1" fill="currentColor" />
                    </button>
                    <div className="text-center">
                      <p className="text-xs font-label-caps tracking-widest text-primary-container font-bold">
                        CLICK TO STREAM SUNBIRD LESSON
                      </p>
                      <p className="text-[11px] text-white/70 mt-0.5">
                        {activeModule.duration} · High Bitrate Official Audio/Video
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                    <div className={`h-full bg-primary-container ${isComplete ? 'w-full' : 'w-0'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Bar Details */}
            <div className="p-6 md:p-8 space-y-6 bg-surface-container-lowest">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded bg-surface-container border border-white/5 text-[10px] font-label-caps text-primary-container tracking-wider font-bold">
                      {t("courses.lesson", "LESSON")} {activeIndex + 1} {t("common.of", "OF")} {modules.length}
                    </span>
                    <span className="text-xs text-on-surface-variant font-label-caps">{activeModule.duration}</span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface">
                    {tEntity(activeModule.title)}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="glow-button-secondary flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-label-caps tracking-widest text-xs font-bold"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? "STOP STREAM" : "START STREAM"}
                  </button>

                  <button 
                    onClick={toggleComplete}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-label-caps tracking-widest text-xs font-bold transition-all border shrink-0 ${
                      isComplete 
                      ? 'bg-primary-container/10 border-primary-container/40 text-primary-container shadow-[0_0_15px_rgba(57,255,20,0.1)]' 
                      : 'glow-button text-black'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isComplete ? 'fill-primary-container/20' : ''}`} />
                    {isComplete ? t("courses.completed", "COMPLETED") : t("courses.markComplete", "MARK LESSON COMPLETE")}
                  </button>
                </div>
              </div>

              <p className="text-on-surface-variant text-sm leading-relaxed border-t border-white/5 pt-4">
                {tEntity(activeModule.overview)}
              </p>
            </div>
          </div>

          {/* Tabbed Interactive Lesson Data & Statements */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <button
                onClick={() => setActiveTab("statements")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-all ${
                  activeTab === "statements"
                    ? "bg-primary-container/20 border border-primary-container text-primary-container"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                {t("courses.curriculumStatements", "CURRICULUM STATEMENTS")} ({activeModule.statements.length})
              </button>

              <button
                onClick={() => setActiveTab("takeaways")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-all ${
                  activeTab === "takeaways"
                    ? "bg-primary-container/20 border border-primary-container text-primary-container"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                {t("courses.keyTakeaways", "KEY TAKEAWAYS")}
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-all ${
                  activeTab === "notes"
                    ? "bg-primary-container/20 border border-primary-container text-primary-container"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {t("notes.title", "MY NOTES")}
              </button>
            </div>

            {/* Statements List */}
            {activeTab === "statements" && (
              <div className="space-y-3">
                <p className="text-xs text-on-surface-variant mb-4">
                  {t("courses.statementsDesc", "Official statements and learning benchmarks covered in this video module:")}
                </p>
                {activeModule.statements.map((stmt, sIdx) => (
                  <div key={sIdx} className="p-4 rounded-xl bg-surface-container border border-white/5 flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary-container shrink-0 mt-0.5" />
                    <p className="text-sm text-on-surface leading-relaxed">
                      {tEntity(stmt)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Key Takeaways */}
            {activeTab === "takeaways" && (
              <div className="space-y-3">
                {activeModule.keyTakeaways.map((takeaway, tIdx) => (
                  <div key={tIdx} className="p-4 rounded-xl bg-surface-container border border-white/5 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-secondary-container/20 text-secondary-container text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {tIdx + 1}
                    </span>
                    <p className="text-sm text-on-surface leading-relaxed">
                      {tEntity(takeaway)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {activeTab === "notes" && (
              <div className="space-y-3">
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder={t("notes.writeNote", "Record your observations, formula notes, or survey questions for this lesson...")}
                  rows={5}
                  className="w-full p-4 rounded-xl bg-surface-container-high border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary-container"
                />
                <p className="text-[11px] text-on-surface-variant">
                  {t("notes.autoPreserved", "Notes are automatically preserved for this session.")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Playlist */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl flex flex-col border border-white/5 space-y-6 sticky top-24">
            <div>
              <span className="text-[10px] font-label-caps text-on-surface-variant">
                {t("courses.syllabus", "COURSE SYLLABUS")}
              </span>
              <h3 className="font-display text-xl font-bold text-on-surface line-clamp-2 mt-1">
                {tEntity(course.title)}
              </h3>
              
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-container/60 to-primary-container transition-all duration-500"
                    style={{ width: `${(completedModules.length / modules.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-primary-container">
                  {completedModules.length}/{modules.length}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {modules.map((mod, i) => {
                const isActive = mod.id === activeModuleId;
                const isDone = completedModules.includes(mod.id);
                
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setActiveModuleId(mod.id);
                      setIsPlaying(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex gap-3.5 ${
                      isActive 
                        ? 'bg-primary-container/10 border border-primary-container/40 shadow-[0_0_20px_rgba(57,255,20,0.08)]' 
                        : 'hover:bg-surface-container border border-transparent'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-primary-container fill-primary-container/20" />
                      ) : (
                        <PlayCircle className={`w-5 h-5 ${isActive ? 'text-primary-container' : 'text-on-surface-variant'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-xs leading-snug line-clamp-2 mb-1 ${isActive ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                        {i + 1}. {tEntity(mod.title)}
                      </p>
                      <p className="text-[10px] font-label-caps text-on-surface-variant/70">{mod.duration}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Practice Link */}
            <div className="pt-4 border-t border-white/5">
              <Link
                href="/learner/assessments"
                className="w-full glow-button-secondary py-3 rounded-xl font-label-caps text-xs font-bold text-center block"
              >
                {t("courses.testSkills", "TEST SKILLS ON THIS COURSE")}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
