"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useTranslation } from "@/components/language/language-provider";

interface CourseInfo { courseId: string; title: string; enrolledCount: number; }
interface Discussion { id: string; courseId: string; employeeId: string; employeeName: string; parentId?: string; content: string; createdAt: string; }

export function CommunityClient({
  enrolledCourseIds,
  courses,
  employeeId,
  employeeName,
}: {
  enrolledCourseIds: string[];
  courses: CourseInfo[];
  employeeId: string;
  employeeName: string;
}) {
  const { t, tEntity } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState(enrolledCourseIds[0] ?? null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    fetch(`/api/discussions?courseId=${selectedCourse}`)
      .then((r) => r.json())
      .then((j) => setDiscussions(j.data?.discussions ?? []))
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const post = async () => {
    if (!newPost.trim() || !selectedCourse) return;
    setPosting(true);
    const res = await fetch("/api/discussions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: selectedCourse, content: newPost.trim() }),
    });
    if (res.ok) {
      const { discussion } = (await res.json()).data;
      setDiscussions((prev) => [discussion, ...prev]);
      setNewPost("");
    }
    setPosting(false);
  };

  const enrolledCourseInfos = courses.filter((c) => enrolledCourseIds.includes(c.courseId));

  if (enrolledCourseIds.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center border border-dashed border-white/10">
        <MessageSquare className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
        <p className="text-on-surface-variant text-sm">
          {t("community.enrollToDiscuss", "Enroll in a course to join its discussion.")}
        </p>
      </div>
    );
  }

  const topLevelPosts = discussions.filter((d) => !d.parentId);

  return (
    <div className="space-y-4">
      {/* Course selector */}
      <div className="flex gap-2 flex-wrap">
        {enrolledCourseInfos.map((c) => {
          const translatedTitle = tEntity(c.title);
          return (
            <button
              key={c.courseId}
              onClick={() => setSelectedCourse(c.courseId)}
              className={`px-4 py-2 rounded-full text-xs font-label-caps border transition-all ${
                selectedCourse === c.courseId
                  ? "bg-secondary-container/20 border-secondary-container/40 text-secondary-container"
                  : "bg-surface-container-low border-white/10 text-on-surface-variant hover:border-white/20"
              }`}
            >
              {translatedTitle.length > 30 ? translatedTitle.slice(0, 30) + "…" : translatedTitle}
            </button>
          );
        })}
      </div>

      {/* Post input */}
      {selectedCourse && (
        <div className="glass-panel rounded-2xl p-4 border border-white/5">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center font-bold text-black text-sm shrink-0">
              {employeeName.charAt(0)}
            </div>
            <div className="flex-1">
              <textarea
                rows={2}
                className="w-full bg-surface-container-low border border-white/10 rounded-xl px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-primary-container/50 resize-none"
                placeholder={t("community.placeholder", "Ask a question or share an insight with your cohort...")}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={post}
                  disabled={posting || !newPost.trim()}
                  className="flex items-center gap-2 glow-button-secondary px-4 py-2 rounded-full font-label-caps text-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {posting ? t("community.posting", "Posting...") : t("community.post", "Post")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discussion feed */}
      {loading ? (
        <div className="text-center text-on-surface-variant py-8 text-sm">
          {t("common.loading", "Loading discussions...")}
        </div>
      ) : topLevelPosts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center border border-dashed border-white/10">
          <p className="text-on-surface-variant text-sm">
            {t("community.noDiscussions", "No questions yet — be the first to start the conversation.")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topLevelPosts.map((d) => {
            const replies = discussions.filter((r) => r.parentId === d.id);
            return (
              <div key={d.id} className="glass-panel rounded-xl p-5 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center font-bold text-xs text-on-surface-variant shrink-0">
                    {d.employeeName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-on-surface">
                        {d.employeeId === employeeId ? t("community.you", "You") : d.employeeName.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/50">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{d.content}</p>
                    {replies.length > 0 && (
                      <div className="mt-3 pl-3 border-l border-white/10 space-y-2">
                        {replies.map((r) => (
                          <div key={r.id} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-[10px] font-bold text-on-surface-variant shrink-0">
                              {r.employeeName.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-on-surface">
                                {r.employeeId === employeeId ? t("community.you", "You") : r.employeeName.split(" ")[0]}
                              </span>
                              <p className="text-xs text-on-surface-variant mt-0.5">{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
