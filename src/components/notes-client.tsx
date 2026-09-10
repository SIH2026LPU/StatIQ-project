"use client";

import { useState } from "react";
import { useTranslation } from "@/components/language/language-provider";
import { Trash2, Edit3, Check, X, Plus, BookMarked, Clock } from "lucide-react";

interface Note {
  id: string;
  courseId: string;
  courseName: string;
  moduleKey?: string;
  timestampSeconds?: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Course { id: string; title: string; }

export function NotesClient({ initialNotes, courses }: { initialNotes: Note[]; courses: Course[] }) {
  const { t, tEntity } = useTranslation();
  const [notes, setNotes] = useState(initialNotes);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newNote, setNewNote] = useState({ courseId: courses[0]?.id ?? "", content: "" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const grouped = courses
    .filter((c) => notes.some((n) => n.courseId === c.id))
    .map((c) => ({ course: c, notes: notes.filter((n) => n.courseId === c.id) }));

  const saveEdit = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    if (res.ok) {
      const { note } = (await res.json()).data;
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content: note.content, updatedAt: note.updatedAt } : n)));
    }
    setEditing(null);
    setSaving(false);
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const createNote = async () => {
    if (!newNote.content.trim() || !newNote.courseId) return;
    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: newNote.courseId, content: newNote.content }),
    });
    if (res.ok) {
      const { note } = (await res.json()).data;
      const courseName = courses.find((c) => c.id === note.courseId)?.title ?? note.courseId;
      setNotes((prev) => [{ ...note, courseName }, ...prev]);
      setNewNote((prev) => ({ ...prev, content: "" }));
      setAdding(false);
    }
    setSaving(false);
  };

  const formatTs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Add note panel */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary-container transition-colors"
          >
            <Plus className="w-4 h-4" /> {t("notes.addNote", "Add a note")}
          </button>
        ) : (
          <div className="space-y-4">
            <select
              className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary-container/50"
              value={newNote.courseId}
              onChange={(e) => setNewNote((p) => ({ ...p, courseId: e.target.value }))}
            >
              {courses.map((c) => <option key={c.id} value={c.id}>{tEntity(c.title)}</option>)}
            </select>
            <textarea
              rows={3}
              className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary-container/50 resize-none"
              placeholder={t("notes.writeNote", "Write your note...")}
              value={newNote.content}
              onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-full text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                {t("notes.cancel", "Cancel")}
              </button>
              <button onClick={createNote} disabled={saving || !newNote.content.trim()} className="glow-button px-5 py-2 rounded-full font-label-caps text-xs text-black disabled:opacity-50">
                {saving ? t("common.loading", "Saving...") : t("notes.save", "Save Note")}
              </button>
            </div>
          </div>
        )}
      </div>

      {grouped.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center border border-dashed border-white/10">
          <BookMarked className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-on-surface mb-2">{t("notes.noNotes", "No notes yet")}</h3>
          <p className="text-on-surface-variant text-sm">{t("notes.noNotesDesc", "Add notes while studying — they'll appear here grouped by course.")}</p>
        </div>
      )}

      {grouped.map(({ course, notes: courseNotes }) => (
        <section key={course.id}>
          <h2 className="font-display text-lg font-bold text-on-surface mb-3">{tEntity(course.title)}</h2>
          <div className="space-y-3">
            {courseNotes.map((note) => (
              <div key={note.id} className="glass-panel rounded-xl p-5 border border-white/5 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {editing === note.id ? (
                      <textarea
                        rows={3}
                        autoFocus
                        className="w-full bg-surface-container-low border border-primary-container/30 rounded-lg px-3 py-2 text-on-surface text-sm resize-none focus:outline-none"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    ) : (
                      <p className="text-sm text-on-surface leading-relaxed">{note.content}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {note.timestampSeconds !== undefined && (
                        <span className="flex items-center gap-1 text-[10px] font-label-caps text-primary-container/80">
                          <Clock className="w-3 h-3" /> {formatTs(note.timestampSeconds)}
                        </span>
                      )}
                      <span className="text-[10px] text-on-surface-variant/60">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {editing === note.id ? (
                      <>
                        <button onClick={() => saveEdit(note.id)} className="p-1.5 rounded-lg hover:bg-primary-container/10 text-primary-container" title="Save">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditing(note.id); setEditContent(note.content); }} className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
