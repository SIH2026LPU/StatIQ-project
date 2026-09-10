/**
 * iGOT Karmayogi / Sunbird Course-Service — Type Definitions
 *
 * Shapes match the real Sunbird API contract as documented in the official
 * Sunbird developer docs and the open-source `sunbird-mobile-sdk`.
 *
 * This project uses a MOCK provider that returns data shaped to this real
 * contract. There is no production iGOT access — the mock is honest:
 * "Mock — shaped to Sunbird API contract".
 *
 * Sources:
 *   POST /api/course/v1/batch/list
 *   POST /api/course/v1/batch/create
 *   GET  /api/course/v1/user/enrollment/list/{userId}
 *   POST /api/course/v1/content/state/read
 */

// ─────────────────────────────────────────────────────────────────────────────
// Batch model (Sunbird batches are the unit of enrollment — not abstract courses)
// ─────────────────────────────────────────────────────────────────────────────

export type EnrollmentType = "open" | "invite-only";

export interface CourseBatch {
  /** Sunbird batchId — required when enrolling */
  batchId: string;
  /** Sunbird courseId for the parent course */
  courseId: string;
  name: string;
  description?: string;
  enrollmentType: EnrollmentType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: "upcoming" | "ongoing" | "expired";
  enrollmentEndDate?: string;
  createdBy?: string;
  /** Honest provenance label for this data source */
  dataProvenance: "Mock — shaped to Sunbird API contract";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sunbird-shaped Enrollment
// ─────────────────────────────────────────────────────────────────────────────

export interface SunbirdEnrollment {
  courseId: string;
  batchId: string;
  userId: string;
  active: boolean;
  enrolledDate: string;
  completionPercentage: number;
  status: 0 | 1 | 2; // 0=not-started, 1=in-progress, 2=completed
  certificates?: Array<{ identifier: string; name: string; token: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Content state (per Sunbird progress-service contract)
// ─────────────────────────────────────────────────────────────────────────────

export interface ContentState {
  contentId: string;
  courseId: string;
  batchId: string;
  userId: string;
  status: 0 | 1 | 2; // 0=not-started, 1=in-progress, 2=completed
  score?: number;
  lastAccessTime?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Input types for create/enroll operations
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateBatchInput {
  /** matches Sunbird POST /api/course/v1/batch/create request body */
  courseId: string;
  name: string;
  description?: string;
  enrollmentType: EnrollmentType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  enrollmentEndDate?: string;
}

export interface ListBatchesFilter {
  courseId?: string;
  status?: CourseBatch["status"];
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy filter type (kept for internal catalogue search)
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseFilters {
  query?: string;
  courseId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider interface — mirrors CourseService in the official sunbird-mobile-sdk
//   getCourseBatches       → listBatches
//   getUserEnrolledCourses → getUserEnrollments
//   enrollCourse           → enrollCourse (userId + courseId + batchId)
//   unenrollCourse         → unenrollCourse
//   updateContentState     → readContentState
// ─────────────────────────────────────────────────────────────────────────────

export interface IGOTProvider {
  /**
   * POST /api/course/v1/batch/list
   * Filter course batches; each batch has courseId + batchId.
   */
  listBatches(filters: ListBatchesFilter): Promise<CourseBatch[]>;

  /**
   * POST /api/course/v1/batch/create
   * Trainer/admin operation to create a new batch.
   */
  createBatch(input: CreateBatchInput): Promise<CourseBatch>;

  /**
   * GET /api/course/v1/user/enrollment/list/{userId}
   * All batches the user is enrolled in (each enrollment references batchId).
   */
  getUserEnrollments(userId: string): Promise<SunbirdEnrollment[]>;

  /**
   * Enroll user in a specific batch (courseId + batchId are both required in the
   * real Sunbird API — a user always enrolls in a *batch*, not an abstract course).
   */
  enrollCourse(
    userId: string,
    courseId: string,
    batchId: string,
  ): Promise<SunbirdEnrollment>;

  /**
   * Unenroll (leave) a specific batch.
   */
  unenrollCourse(
    userId: string,
    courseId: string,
    batchId: string,
  ): Promise<void>;

  /**
   * POST /api/course/v1/content/state/read
   * Per-content progress for the user in a specific batch.
   */
  readContentState(
    userId: string,
    courseId: string,
    batchId: string,
    contentIds: string[],
  ): Promise<ContentState[]>;

  /**
   * Returns "LIVE" when pointed at a real Sunbird instance,
   * or "MOCK — shaped to Sunbird API contract" when in mock mode.
   */
  status(): "LIVE" | "MOCK — shaped to Sunbird API contract";
}
