import { db } from "@/db/store";
import { getIGOTProvider } from "@/lib/integrations/igot";
import { CourseCatalogueView } from "@/components/course-catalogue-view";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Courses & Training Catalogue — StatIQ AI",
  description: "Explore curated official statistics courses aligned to iGOT Karmayogi and NSSTA competency frameworks.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; provider?: string; difficulty?: string }>;
}) {
  const params = await searchParams;
  const igotStatus = getIGOTProvider().status();
  const allCourses = db.listCourses();
  const mappings = db.listCourseCompetencies();
  const competencies = db.listCompetencies();

  const formattedCourses = allCourses.map((c) => {
    const comps = mappings
      .filter((m) => m.courseId === c.id)
      .map((m) => competencies.find((comp) => comp.id === m.competencyId)?.name)
      .filter((name): name is string => Boolean(name));

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      provider: c.provider,
      difficulty: c.difficulty,
      durationHours: c.durationHours,
      competencies: comps,
    };
  });

  return (
    <CourseCatalogueView
      courses={formattedCourses}
      igotStatus={igotStatus}
      initialQuery={params.q}
      initialProvider={params.provider}
      initialDifficulty={params.difficulty}
    />
  );
}
