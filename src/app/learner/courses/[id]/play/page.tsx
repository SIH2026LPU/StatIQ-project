import { notFound } from "next/navigation";
import { db } from "@/db/store";
import { CoursePlayer } from "@/components/course-player";

export default async function CoursePlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = db.getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="animate-fade-up">
      <CoursePlayer course={course} />
    </div>
  );
}
