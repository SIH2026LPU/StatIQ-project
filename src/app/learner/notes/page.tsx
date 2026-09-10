import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { redirect } from "next/navigation";
import { BookMarked, Bell } from "lucide-react";
import { NotesClient } from "@/components/notes-client";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");

  const notes = db.listNotes(session.employeeId);
  const courses = db.listCourses();

  return (
    <div className="space-y-8 animate-fade-up max-w-4xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-container/30 bg-secondary-container/10 font-label-caps text-label-caps text-secondary-container">
          <BookMarked className="w-4 h-4" />
          PERSONAL NOTES
        </div>
        <h1 className="font-display text-4xl font-bold text-on-surface">Learning Notes</h1>
        <p className="text-on-surface-variant">Your annotations across all courses. Notes are private to you.</p>
      </header>

      <NotesClient
        initialNotes={notes.map((n) => ({
          ...n,
          courseName: courses.find((c) => c.id === n.courseId)?.title ?? n.courseId,
        }))}
        courses={courses.map((c) => ({ id: c.id, title: c.title }))}
      />
    </div>
  );
}
