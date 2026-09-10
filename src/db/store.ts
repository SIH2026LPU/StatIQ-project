import { generateWorld, type World } from "@/db/world";
import type {
  AssessmentAttempt,
  DocumentChunk,
  DocumentRecord,
  EmployeeCompetency,
  Enrollment,
  Question,
  Recommendation,
  User,
} from "@/types/domain";
import { verifyPassword } from "@/lib/auth/password";

const scale = process.env.SEED_SCALE === "full" ? "full" : "demo";
const world: World = generateWorld(scale);

const extra = {
  attempts: [] as AssessmentAttempt[],
  recommendations: [] as Recommendation[],
  learningPaths: [] as Array<{
    id: string;
    employeeId: string;
    targetRoleId: string;
    goal: string;
    estimatedHours: number;
    courseIds: string[];
  }>,
  notifications: [] as Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
  }>,
  audit: [] as Array<{
    id: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
  }>,
  progress: [] as Array<{
    id: string;
    employeeId: string;
    courseId: string;
    moduleKey: string;
    percent: number;
    timeSpentMinutes: number;
    completed: boolean;
    idempotencyKey?: string;
  }>,
  notes: [] as Array<{
    id: string;
    employeeId: string;
    courseId: string;
    moduleKey?: string;
    timestampSeconds?: number;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>,
  bookmarks: [] as Array<{
    id: string;
    employeeId: string;
    targetType: "VIDEO_TIMESTAMP" | "LESSON" | "RESOURCE" | "QUESTION";
    courseId?: string;
    moduleKey?: string;
    timestampSeconds?: number;
    label: string;
    createdAt: string;
  }>,
  moduleProgress: [] as Array<{
    id: string;
    employeeId: string;
    courseId: string;
    moduleKey: string;
    status: "LOCKED" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    videoPositionSeconds: number;
    watchedSeconds: number;
    lastOpenedAt?: string;
    completedAt?: string;
  }>,
  discussions: [] as Array<{
    id: string;
    courseId: string;
    employeeId: string;
    employeeName: string;
    parentId?: string;
    content: string;
    createdAt: string;
  }>,
  labExecutions: [] as Array<{
    id: string;
    employeeId: string;
    courseId?: string;
    language: "PYTHON" | "SQL";
    code: string;
    output?: string;
    status: "SUCCESS" | "ERROR" | "TIMEOUT";
    durationMs?: number;
    createdAt: string;
  }>,
};

export const db = {
  backend: process.env.DATABASE_URL ? "postgres" : "in-process-world",
  synthetic: true as const,
  getOrganization: () => world.organization,
  listUsers: () => world.users,
  findUserByEmail: (email: string) =>
    world.users.find((user) => user.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id: string) => world.users.find((user) => user.id === id),
  addUser: (user: User) => {
    world.users.push(user);
    return user;
  },
  listEmployees: () => world.employees,
  addEmployee: (emp: (typeof world.employees)[number]) => {
    world.employees.push(emp);
    return emp;
  },
  getEmployee: (id: string) => {
    const found = world.employees.find((item) => item.id === id);
    if (found) return found;
    // Fallback shim to prevent Next.js UI from triggering a force-logout when querying Postgres UUIDs
    return {
      id,
      userId: id,
      organizationId: "org1",
      name: "Authenticated Learner",
      designation: "Learner",
      departmentId: "d1",
      jobRoleId: "r1",
      targetRoleId: "r2",
      careerGoal: "Continuous Learning",
      preferredLanguage: "en",
      education: [],
      experienceYears: 0
    } as any;
  },
  resolveEmployeeForSession: (session: { id: string; email: string; employeeId?: string, name?: string }) => {
    if (session.employeeId) {
      const byId = world.employees.find((item) => item.id === session.employeeId);
      if (byId) return byId;
      const byUserAsEmployeeId = world.employees.find((item) => item.userId === session.employeeId);
      if (byUserAsEmployeeId) return byUserAsEmployeeId;
    }
    const localUser =
      world.users.find((item) => item.id === session.id) ??
      world.users.find((item) => item.email.toLowerCase() === session.email.toLowerCase());
    if (localUser?.employeeId) {
      const linked = world.employees.find((item) => item.id === localUser.employeeId);
      if (linked) return linked;
    }
    const fallback = world.employees.find((item) => item.userId === session.id);
    if (fallback) return fallback;

    // Fallback shim to prevent UI from triggering a force-logout
    return {
      id: session.employeeId || session.id,
      userId: session.id,
      organizationId: "org1",
      name: session.name || session.email.split("@")[0],
      designation: "Learner",
      departmentId: "d1",
      jobRoleId: "r1",
      targetRoleId: "r2",
      careerGoal: "Continuous Learning",
      preferredLanguage: "en",
      education: [],
      experienceYears: 0
    } as any;
  },
  updateEmployee: (id: string, patch: Partial<{ careerGoal: string; targetRoleId: string; preferredLanguage: string }>) => {
    const employee = world.employees.find((item) => item.id === id);
    if (!employee) return null;
    Object.assign(employee, patch);
    return employee;
  },
  listDepartments: () => world.departments,
  getDepartment: (id: string) => world.departments.find((item) => item.id === id),
  listRoles: () => world.jobRoles,
  getRole: (id: string) => world.jobRoles.find((item) => item.id === id),
  listCategories: () => world.categories,
  listCompetencies: () => world.competencies,
  getCompetency: (id: string) => world.competencies.find((item) => item.id === id),
  listEmployeeCompetencies: (employeeId?: string) =>
    employeeId
      ? world.employeeCompetencies.filter((item) => item.employeeId === employeeId)
      : world.employeeCompetencies,
  listRoleCompetencies: (roleId?: string) =>
    roleId
      ? world.roleCompetencies.filter((item) => item.roleId === roleId)
      : world.roleCompetencies,
  listCourses: () => world.courses.filter((c) => c.availability !== "closed"),
  addCourse: (course: (typeof world.courses)[number]) => {
    world.courses.push(course);
    return course;
  },
  getCourse: (id: string) => world.courses.find((item) => item.id === id),
  listCourseCompetencies: () => world.courseCompetencies,
  listProgrammes: () => world.programmes,
  listEnrollments: (employeeId?: string) =>
    employeeId
      ? world.enrollments.filter((item) => item.employeeId === employeeId)
      : world.enrollments,
  addEnrollment: (enrollment: Enrollment) => {
    world.enrollments.push(enrollment);
    return enrollment;
  },
  listAssessments: () => world.assessments,
  getAssessment: (id: string) => {
    const found = world.assessments.find(
      (item) => item.id === id || item.courseId === id || `asm-${item.courseId}` === id
    );
    if (found) return found;
    const courseId = id.replace(/^asm-/, "");
    const course = world.courses.find((c) => c.id === courseId || c.id === id);
    if (course) {
      const dynamicAsm = {
        id,
        title: `${course.title} — Module Assessment`,
        competencyId: "c-sql",
        courseId: course.id,
        questionCount: 5,
        adaptive: true,
      };
      world.assessments.push(dynamicAsm);
      return dynamicAsm;
    }
    return undefined;
  },
  listQuestions: (assessmentId?: string) => {
    if (!assessmentId) return world.questions;
    const direct = world.questions.filter((item) => item.assessmentId === assessmentId);
    if (direct.length > 0) return direct;
    const asm = world.assessments.find((a) => a.id === assessmentId);
    if (asm?.courseId) {
      const byCourse = world.questions.filter((item) => item.assessmentId && item.assessmentId.includes(asm.courseId!));
      if (byCourse.length > 0) return byCourse;
    }
    return world.questions.slice(0, 5);
  },
  addQuestions: (items: Question[]) => {
    world.questions.push(...items);
  },
  updateQuestionStatus: (id: string, status: Question["status"]) => {
    const question = world.questions.find((item) => item.id === id);
    if (question) question.status = status;
    return question;
  },
  listAttempts: (employeeId?: string) =>
    employeeId
      ? extra.attempts.filter((item) => item.employeeId === employeeId)
      : extra.attempts,
  addAttempt: (attempt: AssessmentAttempt) => {
    extra.attempts.push(attempt);
    return attempt;
  },
  upsertEmployeeCompetency: (record: EmployeeCompetency) => {
    const index = world.employeeCompetencies.findIndex(
      (item) =>
        item.employeeId === record.employeeId &&
        item.competencyId === record.competencyId,
    );
    if (index >= 0) world.employeeCompetencies[index] = record;
    else world.employeeCompetencies.push(record);
    return record;
  },
  listDocuments: () => world.documents,
  listChunks: () => world.chunks,
  addChunks: (chunks: DocumentChunk[]) => {
    world.chunks.push(...chunks);
  },
  addDocument: (doc: DocumentRecord) => {
    world.documents.push(doc);
    return doc;
  },
  saveRecommendations: (employeeId: string, recs: Recommendation[]) => {
    extra.recommendations = extra.recommendations.filter(
      (item) => !recs.some((rec) => rec.courseId === item.courseId),
    );
    extra.recommendations.push(...recs);
    return recs;
  },
  listRecommendations: () => extra.recommendations,
  addLearningPath: (path: (typeof extra.learningPaths)[number]) => {
    extra.learningPaths.push(path);
    return path;
  },
  listLearningPaths: (employeeId: string) =>
    extra.learningPaths.filter((p) => p.employeeId === employeeId),
  addNotification: (n: (typeof extra.notifications)[number]) => {
    extra.notifications.push(n);
    return n;
  },
  listNotifications: (userId: string) => extra.notifications.filter((n) => n.userId === userId),
  addAudit: (row: (typeof extra.audit)[number]) => extra.audit.push(row),
  addProgress: (row: (typeof extra.progress)[number]) => {
    if (row.idempotencyKey && extra.progress.some((p) => p.idempotencyKey === row.idempotencyKey)) {
      return extra.progress.find((p) => p.idempotencyKey === row.idempotencyKey)!;
    }
    extra.progress.push(row);
    return row;
  },
  listProgress: (employeeId: string) => extra.progress.filter((p) => p.employeeId === employeeId),
  // Notes
  addNote: (note: (typeof extra.notes)[number]) => { extra.notes.push(note); return note; },
  updateNote: (id: string, content: string) => {
    const note = extra.notes.find((n) => n.id === id);
    if (note) { note.content = content; note.updatedAt = new Date().toISOString(); }
    return note;
  },
  deleteNote: (id: string) => { const idx = extra.notes.findIndex((n) => n.id === id); if (idx >= 0) extra.notes.splice(idx, 1); },
  listNotes: (employeeId: string) => extra.notes.filter((n) => n.employeeId === employeeId),
  // Bookmarks
  addBookmark: (bm: (typeof extra.bookmarks)[number]) => { extra.bookmarks.push(bm); return bm; },
  deleteBookmark: (id: string) => { const idx = extra.bookmarks.findIndex((b) => b.id === id); if (idx >= 0) extra.bookmarks.splice(idx, 1); },
  listBookmarks: (employeeId: string) => extra.bookmarks.filter((b) => b.employeeId === employeeId),
  // Module progress
  upsertModuleProgress: (record: (typeof extra.moduleProgress)[number]) => {
    const idx = extra.moduleProgress.findIndex((m) => m.employeeId === record.employeeId && m.courseId === record.courseId && m.moduleKey === record.moduleKey);
    if (idx >= 0) extra.moduleProgress[idx] = record; else extra.moduleProgress.push(record);
    return record;
  },
  getModuleProgress: (employeeId: string, courseId: string, moduleKey: string) =>
    extra.moduleProgress.find((m) => m.employeeId === employeeId && m.courseId === courseId && m.moduleKey === moduleKey),
  listModuleProgress: (employeeId: string, courseId?: string) =>
    courseId ? extra.moduleProgress.filter((m) => m.employeeId === employeeId && m.courseId === courseId) : extra.moduleProgress.filter((m) => m.employeeId === employeeId),
  // Discussions
  addDiscussion: (d: (typeof extra.discussions)[number]) => { extra.discussions.push(d); return d; },
  listDiscussions: (courseId: string) => extra.discussions.filter((d) => d.courseId === courseId),
  // Lab executions
  addLabExecution: (exec: (typeof extra.labExecutions)[number]) => { extra.labExecutions.push(exec); return exec; },
  listLabExecutions: (employeeId: string) => extra.labExecutions.filter((e) => e.employeeId === employeeId),
  // Mark notifications read
  markNotificationRead: (id: string) => {
    const n = extra.notifications.find((n) => n.id === id);
    if (n) n.read = true;
    return n;
  },
  countUnreadNotifications: (userId: string) => extra.notifications.filter((n) => n.userId === userId && !n.read).length,
  authenticate: (email: string, password: string): User | undefined => {
    const user = world.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user) return undefined;
    const ok = verifyPassword(password, user.password);
    return ok ? user : undefined;
  },
};
