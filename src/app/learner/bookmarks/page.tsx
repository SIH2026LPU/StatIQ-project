import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { redirect } from "next/navigation";
import { Bookmark, Clock, X } from "lucide-react";
import { BookmarksClient } from "@/components/bookmarks-client";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");

  const bookmarks = db.listBookmarks(session.employeeId);
  const courses = db.listCourses();

  return (
    <div className="space-y-8 animate-fade-up max-w-4xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <Bookmark className="w-4 h-4" />
          SAVED ITEMS
        </div>
        <h1 className="font-display text-4xl font-bold text-on-surface">Bookmarks</h1>
        <p className="text-on-surface-variant">Saved video timestamps, lessons and resources.</p>
      </header>
      <BookmarksClient
        initialBookmarks={bookmarks.map((bm) => ({
          ...bm,
          courseName: courses.find((c) => c.id === bm.courseId)?.title ?? (bm.courseId ?? "Unknown"),
        }))}
      />
    </div>
  );
}
