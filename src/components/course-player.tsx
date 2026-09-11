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
  const modules = getCurriculumForCourse(course.title, course.provider, course.id);

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
          
          {/* Video Container Panel */}
          <div className="glass-panel rounded-3xl overflow-hidden border-t-[3px] border-t-primary-container shadow-2xl relative flex flex-col">
            
            {/* Dedicated Sunbird Stream Header Bar (Above Video, Zero Clutter/Collision) */}
            <div className="px-6 py-3 bg-surface-container-high/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                <span className="font-label-caps font-bold text-on-surface">
                  {course.provider.toUpperCase()} SUNBIRD STREAM
                </span>
                {activeModule.sunbirdContentId && (
                  <span className="text-[10px] font-mono text-primary-container bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/20">
                    {activeModule.sunbirdContentId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-label-caps text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Official Feed
                </span>
                <span className="text-[10px] font-label-caps font-bold text-primary-container px-2 py-0.5 rounded bg-surface-container border border-white/10">
                  1080p HD
                </span>
              </div>
            </div>

            {/* Video Viewport */}
            <div className="bg-[#080c10] aspect-video relative flex items-center justify-center overflow-hidden w-full">
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
                /* ── Real Video Player with YouTube iframe ── */
                <div className="w-full h-full relative">
                  <iframe
                    key={activeModule.id}
                    src={`${activeModule.videoUrl}${activeModule.videoUrl.includes("?") ? "&" : "?"}autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                    title={activeModule.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0 absolute inset-0"
                  />
                </div>
              ) : (
                /* ── Paused / Thumbnail State ── */
                <div 
                  className="relative w-full h-full flex items-center justify-center group cursor-pointer" 
                  onClick={() => setIsPlaying(true)}
                >
                  {/* Themed abstract backdrop — no external image dependency */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f12] via-[#081510] to-[#050a08]" />
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(57,255,20,0.07) 0%, transparent 70%)' }} />
                  {/* Grid pattern */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(57,255,20,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Module meta top-left */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-primary-container/30 text-[10px] font-label-caps text-primary-container font-bold tracking-wider">
                      {t("courses.lesson", "LESSON")} {activeIndex + 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-label-caps text-white/60">
                      {activeModule.duration}
                    </span>
                  </div>

                  {/* Center Play Button */}
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <button 
                      type="button"
                      className="w-20 h-20 rounded-full bg-primary-container/15 border-2 border-primary-container flex items-center justify-center text-primary-container backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-container group-hover:text-black shadow-[0_0_40px_rgba(57,255,20,0.3)] group-hover:shadow-[0_0_60px_rgba(57,255,20,0.5)]"
                    >
                      <Play className="w-8 h-8 ml-1" fill="currentColor" />
                    </button>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white group-hover:text-primary-container transition-colors line-clamp-1 max-w-xs">
                        {tEntity(activeModule.title)}
                      </p>
                      <p className="text-[11px] text-white/50 mt-1 font-label-caps tracking-wider">
                        CLICK TO STREAM · HIGH BITRATE OFFICIAL AUDIO/VIDEO
                      </p>
                    </div>
                  </div>

                  {/* Bottom progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div className={`h-full bg-primary-container transition-all duration-500 ${isComplete ? 'w-full' : 'w-0'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Bar Details */}
            <div className="p-5 md:p-7 bg-surface-container-lowest border-t border-white/5">
              {/* Top row: lesson badge + duration */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-primary-container/10 border border-primary-container/30 text-[10px] font-label-caps text-primary-container tracking-wider font-bold">
                  {t("courses.lesson", "LESSON")} {activeIndex + 1} {t("common.of", "OF")} {modules.length}
                </span>
                <span className="text-[10px] text-on-surface-variant font-label-caps tracking-wider">{activeModule.duration}</span>
                {isComplete && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-label-caps text-emerald-400 font-bold tracking-wider">
                    ✓ COMPLETED
                  </span>
                )}
              </div>

              {/* Module title */}
              <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface mb-4 leading-snug">
                {tEntity(activeModule.title)}
              </h2>

              {/* Action buttons row — flex-wrap prevents cutoff */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="glow-button-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-caps tracking-widest text-xs font-bold whitespace-nowrap shrink-0"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? t("courses.stopStream", "STOP STREAM") : t("courses.startStream", "START STREAM")}
                </button>

                <button 
                  onClick={toggleComplete}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-caps tracking-widest text-xs font-bold transition-all border whitespace-nowrap shrink-0 ${
                    isComplete 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'glow-button text-black'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isComplete ? 'fill-emerald-500/20' : ''}`} />
                  {isComplete ? t("courses.completed", "COMPLETED") : t("courses.markComplete", "MARK LESSON COMPLETE")}
                </button>
              </div>

              {/* Overview text */}
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
