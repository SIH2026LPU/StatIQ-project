import { db } from "@/db/store";
import { TrainerCoursesView } from "@/components/trainer/trainer-courses-view";

export default async function TrainerCourses({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = (resolvedSearchParams.q || "").toLowerCase().trim();

  const allCourses = db.listCourses();
  const rawMaps = db.listCourseCompetencies();
  const documents = db.listDocuments();

  const courses = query
    ? allCourses.filter((c) => {
        const titleMatch = c.title.toLowerCase().includes(query);
        const descMatch = c.description.toLowerCase().includes(query);
        const compMatches = rawMaps
          .filter((m) => m.courseId === c.id)
          .some((m) => {
            const comp = db.getCompetency(m.competencyId);
            return comp?.name.toLowerCase().includes(query);
          });
        return titleMatch || descMatch || compMatches;
      })
    : allCourses;

  const maps = rawMaps.map((m) => ({
    courseId: m.courseId,
    competencyId: m.competencyId,
    competencyName: db.getCompetency(m.competencyId)?.name || m.competencyId,
  }));

  return (
    <TrainerCoursesView
      courses={courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        provider: c.provider,
        difficulty: c.difficulty,
        durationHours: c.durationHours,
        sourceUrl: c.sourceUrl,
      }))}
      maps={maps}
      documents={documents.map((d) => ({
        id: d.id,
        title: d.title,
        mimeType: d.mimeType,
        status: d.status,
      }))}
      query={query}
    />
  );
}
