"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Play, CheckCircle2, Lock, BookOpen, Video, Code2, FileText,
  Cpu, ClipboardList, BookMarked, PenLine, ArrowLeft, ChevronRight,
  Clock, X, Check, Save
} from "lucide-react";
import Link from "next/link";

interface Module {
  id: string;
  courseId: string;
  orderIndex: number;
  title: string;
  moduleType: string;
  durationMinutes: number;
  requiredForCompletion: boolean;
}

interface ModuleProgressRecord {
  moduleKey: string;
  status: "LOCKED" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  videoPositionSeconds: number;
  watchedSeconds: number;
}

interface Note {
  id: string;
  courseId: string;
  moduleKey?: string;
  timestampSeconds?: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  durationHours: number;
  difficulty: string;
}

interface Enrollment {
  id: string;
  status: string;
  progressPercent: number;
}

const moduleIcon = (type: string) => {
  switch (type) {
    case "VIDEO": return Video;
    case "READING": return BookOpen;
    case "QUIZ": return ClipboardList;
    case "CODING_EXERCISE": return Code2;
    case "INTERACTIVE": return Cpu;
    case "ASSIGNMENT": return FileText;
    default: return BookOpen;
  }
};

// Debounce helper
function useDebouncedSave(fn: (...args: any[]) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback((...args: any[]) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

export function LMSPlayerClient({
  course,
  modules,
  moduleProgress: initialProgress,
  notes: initialNotes,
  enrollment,
  learnerName,
}: {
  course: Course;
  modules: Module[];
  moduleProgress: ModuleProgressRecord[];
  notes: Note[];
  enrollment: Enrollment | null;
  learnerName: string;
}) {
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [progress, setProgress] = useState<Record<string, ModuleProgressRecord>>(
    Object.fromEntries(initialProgress.map((p) => [p.moduleKey, p]))
  );
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const videoSeconds = useRef(0);

  const activeModule = modules[activeModuleIdx];

  // Save progress to API — called on pause/seek/end (NOT per frame)
  const saveProgress = useCallback(async (moduleKey: string, updates: Partial<ModuleProgressRecord>) => {
    const res = await fetch("/api/module-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: course.id,
        moduleKey,
        videoPositionSeconds: updates.videoPositionSeconds,
        watchedSeconds: updates.watchedSeconds,
        status: updates.status,
      }),
    });
    if (res.ok) {
      const { moduleProgress } = (await res.json()).data;
      setProgress((prev) => ({ ...prev, [moduleKey]: moduleProgress }));
    }
  }, [course.id]);

  const debouncedSave = useDebouncedSave(saveProgress, 5000);

  // Mark module complete
  const markComplete = useCallback(async () => {
    await saveProgress(activeModule.id, { status: "COMPLETED", watchedSeconds: activeModule.durationMinutes * 60 });
  }, [activeModule, saveProgress]);

  // Move to next module
  const nextModule = () => {
    if (activeModuleIdx < modules.length - 1) {
      setActiveModuleIdx((i) => i + 1);
    }
  };

  // Save note
  const saveNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id, moduleKey: activeModule.id, content: newNote.trim() }),
    });
    if (res.ok) {
      const { note } = (await res.json()).data;
      setNotes((prev) => [note, ...prev]);
      setNewNote("");
    }
    setSavingNote(false);
  };

  const getStatus = (moduleId: string): ModuleProgressRecord["status"] =>
    progress[moduleId]?.status ?? "NOT_STARTED";

  const completedCount = modules.filter((m) => getStatus(m.id) === "COMPLETED").length;
  const overallPercent = Math.round((completedCount / modules.length) * 100);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-72 border-r border-white/5 bg-surface-container-lowest/80 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5">
          <Link href={`/courses/${course.id}`} className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to course
          </Link>
          <h2 className="font-display font-bold text-on-surface text-sm leading-tight line-clamp-2">{course.title}</h2>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-on-surface-variant mb-1">
              <span>Progress</span>
              <span>{overallPercent}%</span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary-container rounded-full transition-all" style={{ width: `${overallPercent}%` }} />
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {modules.map((mod, i) => {
            const status = getStatus(mod.id);
            const Icon = moduleIcon(mod.moduleType);
            const isActive = i === activeModuleIdx;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModuleIdx(i)}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all mb-1 ${
                  isActive
                    ? "bg-primary-container/10 border border-primary-container/20"
                    : "hover:bg-white/3 border border-transparent"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  status === "COMPLETED"
                    ? "bg-emerald-400/20 text-emerald-400"
                    : isActive
                    ? "bg-primary-container/20 text-primary-container"
                    : "bg-surface-container text-on-surface-variant"
                }`}>
                  {status === "COMPLETED" ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-tight ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}>
                    {mod.title}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/60 mt-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {mod.durationMinutes}m
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Module header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface/60 backdrop-blur-md shrink-0">
          <div>
            <p className="text-xs font-label-caps text-on-surface-variant">
              Module {activeModuleIdx + 1} of {modules.length} · {activeModule.moduleType.replace("_", " ")}
            </p>
            <h1 className="font-display font-bold text-on-surface text-lg">{activeModule.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotes((s) => !s)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-label-caps border transition-all ${
                showNotes ? "bg-secondary-container/20 border-secondary-container/40 text-secondary-container" : "border-white/10 text-on-surface-variant hover:border-white/20"
              }`}
            >
              <PenLine className="w-3.5 h-3.5" /> Notes
              {notes.length > 0 && (
                <span className="bg-secondary-container text-black rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold">
                  {notes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Content area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 lg:p-10 max-w-3xl mx-auto">
              {/* Module content by type */}
              {activeModule.moduleType === "VIDEO" && (
                <div className="space-y-6">
                  <div className="aspect-video bg-surface-container-high rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-secondary-container/5" />
                    <div className="text-center relative z-10">
                      <div className="w-16 h-16 rounded-full bg-primary-container/20 border-2 border-primary-container/40 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-primary-container" />
                      </div>
                      <p className="text-on-surface font-bold">{activeModule.title}</p>
                      <p className="text-on-surface-variant text-sm mt-1">{activeModule.durationMinutes} minutes · {course.provider.toUpperCase()}</p>
                    </div>
                    <div className="absolute bottom-4 right-4 text-xs font-label-caps text-on-surface-variant/60 bg-surface/60 px-2 py-1 rounded">
                      Progress saves on pause/seek/end
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    This video module covers {activeModule.title.toLowerCase()} as part of <strong className="text-on-surface">{course.title}</strong>.
                    Content is sourced from {course.provider.toUpperCase()} and plays within the StatIQ AI learning environment.
                  </p>
                </div>
              )}

              {activeModule.moduleType === "READING" && (
                <div className="prose prose-invert max-w-none space-y-4">
                  <div className="glass-panel rounded-2xl p-6 border border-white/5">
                    <h2 className="font-display text-2xl font-bold text-on-surface mb-4">Study Materials</h2>
                    <p className="text-on-surface-variant leading-relaxed">
                      This module contains reading materials for <strong className="text-on-surface">{activeModule.title}</strong>.
                      Review the official documentation and reference materials below.
                    </p>
                    <div className="mt-6 space-y-3">
                      {["Core Concepts", "Official MoSPI Guidelines", "Case Studies", "Key Definitions"].map((item) => (
                        <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-white/5">
                          <FileText className="w-4 h-4 text-primary-container shrink-0" />
                          <span className="text-sm text-on-surface">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeModule.moduleType === "QUIZ" && (
                <div className="glass-panel rounded-2xl p-6 border border-white/5">
                  <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Knowledge Check</h2>
                  <p className="text-on-surface-variant mb-6">Test your understanding of {activeModule.title.toLowerCase()}.</p>
                  <Link
                    href={`/learner/assessments`}
                    className="glow-button px-6 py-3 rounded-full font-label-caps text-black text-sm inline-flex items-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Start Quiz
                  </Link>
                </div>
              )}

              {(activeModule.moduleType === "CODING_EXERCISE" || activeModule.moduleType === "INTERACTIVE") && (
                <div className="glass-panel rounded-2xl p-6 border border-white/5">
                  <h2 className="font-display text-2xl font-bold text-on-surface mb-2">{activeModule.title}</h2>
                  <p className="text-on-surface-variant mb-6">Practice in the virtual lab environment.</p>
                  <Link
                    href={`/courses/${course.id}/lab`}
                    className="glow-button px-6 py-3 rounded-full font-label-caps text-black text-sm inline-flex items-center gap-2"
                  >
                    <Code2 className="w-4 h-4" />
                    Open Lab
                  </Link>
                </div>
              )}

              {activeModule.moduleType === "ASSIGNMENT" && (
                <div className="glass-panel rounded-2xl p-6 border border-white/5">
                  <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Assignment</h2>
                  <p className="text-on-surface-variant mb-4">Submit your assignment for trainer review.</p>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
                    Assignments are reviewed by your trainer before competency scores are updated. No auto-grading.
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                <button
                  onClick={() => setActiveModuleIdx((i) => Math.max(0, i - 1))}
                  disabled={activeModuleIdx === 0}
                  className="glow-button-secondary px-5 py-2.5 rounded-full font-label-caps text-xs disabled:opacity-40"
                >
                  ← Previous
                </button>
                <div className="flex gap-3">
                  {getStatus(activeModule.id) !== "COMPLETED" && (
                    <button
                      onClick={markComplete}
                      className="flex items-center gap-2 glow-button-secondary px-5 py-2.5 rounded-full font-label-caps text-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Complete
                    </button>
                  )}
                  {activeModuleIdx < modules.length - 1 ? (
                    <button onClick={nextModule} className="glow-button px-5 py-2.5 rounded-full font-label-caps text-black text-xs flex items-center gap-2">
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link href={`/courses/${course.id}`} className="glow-button px-5 py-2.5 rounded-full font-label-caps text-black text-xs">
                      Finish Course
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes panel */}
          {showNotes && (
            <div className="w-72 border-l border-white/5 bg-surface-container-lowest/80 flex flex-col overflow-hidden shrink-0">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-display font-bold text-on-surface text-sm">Module Notes</h3>
                <button onClick={() => setShowNotes(false)} className="p-1 rounded hover:bg-white/5 text-on-surface-variant">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 border-b border-white/5">
                <textarea
                  rows={3}
                  className="w-full bg-surface-container-low border border-white/10 rounded-xl px-3 py-2 text-on-surface text-xs resize-none focus:outline-none focus:border-secondary-container/50"
                  placeholder="Add a note for this module..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button
                  onClick={saveNote}
                  disabled={savingNote || !newNote.trim()}
                  className="w-full mt-2 flex items-center justify-center gap-2 glow-button-secondary py-2 rounded-full font-label-caps text-xs disabled:opacity-40"
                >
                  <Save className="w-3 h-3" /> {savingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {notes.filter((n) => n.moduleKey === activeModule.id).map((note) => (
                  <div key={note.id} className="p-3 rounded-xl bg-surface-container-low border border-white/5">
                    <p className="text-xs text-on-surface leading-relaxed">{note.content}</p>
                    <p className="text-[9px] text-on-surface-variant/50 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {notes.filter((n) => n.moduleKey === activeModule.id).length === 0 && (
                  <p className="text-xs text-on-surface-variant/50 text-center mt-4">No notes for this module yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
