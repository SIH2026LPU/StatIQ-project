export interface CourseFilters {
  competency?: string;
  language?: string;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

export interface ExternalCourse {
  externalId: string;
  title: string;
  description: string;
  competencyTags: string[];
  durationHours: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language: string;
  sourceUrl: string;
  qualityScore: number; // 0-1
}

export interface Enrollment {
  externalId: string;
  userId: string;
  courseId: string;
  status: "ENROLLED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED";
  enrolledAt: string;
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  completionPercent: number;
  lastAccessedAt: string;
}

export interface CompletionStatus {
  courseId: string;
  userId: string;
  isComplete: boolean;
  completedAt?: string;
}

/**
 * Shared interface for the iGOT Karmayogi integration.
 * MockIGOTProvider implements this today; OfficialIGOTProvider implements the
 * same interface once IGOT_API_BASE_URL / IGOT_API_KEY are issued — the rest
 * of the app never needs to know which one is active (see provider-factory.ts).
 */
export interface IGOTProvider {
  searchCourses(query: string, filters?: CourseFilters): Promise<ExternalCourse[]>;
  getCourse(courseId: string): Promise<ExternalCourse | null>;
  enroll(userId: string, courseId: string): Promise<Enrollment>;
  getProgress(userId: string, courseId: string): Promise<CourseProgress>;
  getCompletion(userId: string, courseId: string): Promise<CompletionStatus>;
}

export interface TrainingProgramme {
  externalId: string;
  source: "NSSTA" | "TPAC";
  title: string;
  description: string;
  competencyTags: string[];
  targetDesignation?: string;
  durationDays: number;
  venue?: string;
  startDate?: string;
  endDate?: string;
  priority: number;
  sourceUrl: string;
}

export interface NSSTAProvider {
  listProgrammes(filters?: { competency?: string }): Promise<TrainingProgramme[]>;
  getProgramme(externalId: string): Promise<TrainingProgramme | null>;
}
