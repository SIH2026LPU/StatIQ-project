"use client";

import { useState } from "react";
import { Trash2, Bookmark, Clock, Video, BookOpen, HelpCircle, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

interface BookmarkItem {
  id: string;
  courseId?: string;
  courseName: string;
  targetType: "VIDEO_TIMESTAMP" | "LESSON" | "RESOURCE" | "QUESTION";
  moduleKey?: string;
  timestampSeconds?: number;
  label: string;
  createdAt: string;
}

const typeIcon = {
  VIDEO_TIMESTAMP: Video,
  LESSON: BookOpen,
  RESOURCE: LinkIcon,
  QUESTION: HelpCircle,
};

const typeColor = {
  VIDEO_TIMESTAMP: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  LESSON: "text-primary-container bg-primary-container/10 border-primary-container/30",
  RESOURCE: "text-secondary-container bg-secondary-container/10 border-secondary-container/30",
  QUESTION: "text-amber-400 bg-amber-400/10 border-amber-400/30",
};

const formatTs = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function BookmarksClient({ initialBookmarks }: { initialBookmarks: BookmarkItem[] }) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);

  const remove = async (id: string) => {
    await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  if (bookmarks.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-dashed border-white/10">
        <Bookmark className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-on-surface mb-2">No bookmarks yet</h3>
        <p className="text-on-surface-variant text-sm">While studying a course, use the bookmark button to save your spot.</p>
      </div>
    );
  }

  // Group by course
  const courseIds = [...new Set(bookmarks.map((b) => b.courseId ?? "none"))];

  return (
    <div className="space-y-6">
      {courseIds.map((cId) => {
        const group = bookmarks.filter((b) => (b.courseId ?? "none") === cId);
        const courseName = group[0]?.courseName ?? "Unknown Course";
        return (
          <section key={cId}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-bold text-on-surface">{courseName}</h2>
              {cId !== "none" && (
                <Link href={`/courses/${cId}/learn`} className="text-xs text-primary-container hover:underline font-label-caps">
                  CONTINUE →
                </Link>
              )}
            </div>
            <div className="grid gap-3">
              {group.map((bm) => {
                const Icon = typeIcon[bm.targetType];
                return (
                  <div key={bm.id} className="glass-panel rounded-xl p-4 border border-white/5 flex items-center gap-4 group">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${typeColor[bm.targetType]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-on-surface text-sm truncate">{bm.label}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] font-label-caps px-2 py-0.5 rounded-full border ${typeColor[bm.targetType]}`}>
                          {bm.targetType.replace("_", " ")}
                        </span>
                        {bm.timestampSeconds !== undefined && (
                          <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                            <Clock className="w-3 h-3" /> {formatTs(bm.timestampSeconds)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(bm.id)}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 transition-all"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
