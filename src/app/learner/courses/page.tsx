import { db } from "@/db/store";
import { Notice } from "@/components/app-shell";
import { getIGOTProvider } from "@/lib/integrations/igot";
import { getSession } from "@/lib/auth/session";
import { BookOpen } from "lucide-react";
import { CourseCatalogue } from "@/components/course-catalogue";

export default async function CoursesPage() {
  const courses = db.listCourses();
  const session = await getSession();
  const employee = session ? db.resolveEmployeeForSession(session) : null;
  const enrollments = employee ? db.listEnrollments(employee.id) : [];
  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  // Use listBatches — the Sunbird-shaped method (the new interface has no searchCourses).
  const igot = getIGOTProvider();
  const igotBatches = await igot.listBatches({ limit: 100 });
  const igotCourseCount = new Set(igotBatches.map((b) => b.courseId)).size;
  const igotProvenance = igot.status();

  return (
    <div className="space-y-8 animate-fade-up">
      <Notice />
      
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <BookOpen className="w-4 h-4 text-primary-container" />
          LEARNING INVENTORY
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          Course Catalogue
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          Internal, iGOT-shaped and NSSTA adapters share one course model. Live iGOT credentials are not required for this demo.
        </p>
        <p className="text-sm font-label-caps text-on-surface-variant/80 uppercase tracking-widest mt-2">
          iGOT DATA SOURCE: <strong className="text-on-surface">{igotProvenance}</strong> —{" "}
          <strong className="text-on-surface">{igotBatches.length}</strong> batches across{" "}
          <strong className="text-on-surface">{igotCourseCount}</strong> courses
        </p>
      </header>

      <CourseCatalogue initialCourses={courses} enrolledCourseIds={enrolledCourseIds} />
    </div>
  );
}
