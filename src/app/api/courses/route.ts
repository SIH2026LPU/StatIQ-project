import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { assertRole } from "@/lib/auth/rbac";
import type { Course } from "@/types/domain";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const provider = searchParams.get("provider");
  const courses = db.listCourses().filter((course) => {
    const text = `${course.title} ${course.description}`.toLowerCase();
    const matchQ = !q || text.includes(q);
    const matchP = !provider || course.provider === provider;
    return matchQ && matchP;
  });
  return ok({ courses, competencies: db.listCourseCompetencies(), demo: true });
}

export async function POST(request: Request) {
  const gate = await assertRole(["TRAINER", "CONTENT_MANAGER", "ORG_ADMIN", "SUPER_ADMIN"]);
  if (gate.error) return gate.error;
  const body = await request.json();
  const id = `crs-${Date.now()}`;
  const course = db.addCourse({
    id,
    title: String(body.title ?? "Untitled course"),
    description: String(body.description ?? ""),
    provider: (body.provider ?? "internal") as Course["provider"],
    durationHours: Number(body.durationHours ?? 8),
    difficulty: (body.difficulty ?? "medium") as Course["difficulty"],
    language: "en",
    deliveryMode: "online",
    qualityScore: 0.7,
    availability: "open" as const,
  });
  db.addAudit({
    id: `aud-${Date.now()}`,
    userId: gate.session!.id,
    action: "create_course",
    resource: "course",
    resourceId: id,
  });
  return ok(course, 201);
}
