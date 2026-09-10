export type Role =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "TRAINER"
  | "CONTENT_MANAGER"
  | "LEARNER";

export type ProficiencyLevel =
  | "Beginner"
  | "Basic"
  | "Intermediate"
  | "Advanced"
  | "Expert";

export type CourseProvider = "internal" | "igot" | "nssta" | "tpac";

export type DeliveryMode = "online" | "blended" | "in-person";

export type EvidenceSource =
  | "assessment"
  | "certification"
  | "course_completion"
  | "trainer_evaluation"
  | "self_assessment"
  | "verified_work";

export type Difficulty = "easy" | "medium" | "hard";

export interface Organization {
  id: string;
  name: string;
  code: string;
  synthetic: true;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  employeeId?: string;
  name: string;
}

export interface Employee {
  id: string;
  userId: string;
  organizationId: string;
  departmentId: string;
  jobRoleId: string;
  targetRoleId: string;
  name: string;
  designation: string;
  education: string;
  experienceYears: number;
  preferredLanguage: string;
  careerGoal: string;
}

export interface JobRole {
  id: string;
  name: string;
  family: string;
  description: string;
  departmentId?: string;
}

export interface CompetencyCategory {
  id: string;
  name: string;
  description: string;
}

export interface Competency {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  measurementMethod: string;
  defaultTargetLevel: number;
  emerging?: boolean;
}

export interface EmployeeCompetency {
  employeeId: string;
  competencyId: string;
  score: number;
  targetLevel: number;
  confidence: number;
  lastAssessedAt: string;
  evidenceSource: EvidenceSource;
  previousScore?: number;
}

export interface RoleCompetency {
  roleId: string;
  competencyId: string;
  requiredScore: number;
  weight: number;
  organizationalPriority: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  provider: CourseProvider;
  externalId?: string;
  durationHours: number;
  difficulty: Difficulty;
  language: string;
  deliveryMode: DeliveryMode;
  sourceUrl?: string;
  qualityScore: number;
  availability: "open" | "scheduled" | "closed";
}

export interface CourseCompetency {
  courseId: string;
  competencyId: string;
  coverage: number;
}

export interface TrainingProgramme {
  id: string;
  title: string;
  description: string;
  provider: "nssta" | "tpac";
  topic: string;
  targetDesignation: string;
  durationDays: number;
  deliveryMode: DeliveryMode;
  sourceUrl: string;
  year: number;
}

export interface Enrollment {
  id: string;
  employeeId: string;
  courseId: string;
  status: "enrolled" | "in_progress" | "completed";
  progressPercent: number;
  learningHours: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface Assessment {
  id: string;
  title: string;
  competencyId: string;
  courseId?: string;
  questionCount: number;
  adaptive: boolean;
}

export interface Question {
  id: string;
  assessmentId?: string;
  competencyId: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceDocumentId?: string;
  status: "draft" | "review" | "published";
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  employeeId: string;
  score: number;
  startedAt: string;
  submittedAt: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  courseId?: string;
  mimeType: string;
  status: "uploaded" | "indexed" | "failed";
  excerpt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  index: number;
  text: string;
  competencyId?: string;
}

export interface Recommendation {
  courseId: string;
  /** Sunbird batchId — required for real enrollment (courseId + batchId together) */
  batchId?: string;
  /** Sunbird courseId (do_* prefix) when from iGOT, same as courseId for internal */
  sunbirdCourseId?: string;
  score: number;
  gapCoverage: number;
  roleRelevance: number;
  explanation: {
    why: string;
    gapIds: string[];
    targetRoleId: string;
    effortHours: number;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  employeeId?: string;
}
