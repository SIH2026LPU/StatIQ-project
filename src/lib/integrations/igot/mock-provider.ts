/**
 * MockIGOTProvider — Implements the real Sunbird API contract shapes.
 *
 * DATA SOURCE: Mock — shaped to Sunbird API contract
 *
 * This is NOT a live iGOT connection. Credentials for the production
 * iGOT Karmayogi / Sunbird instance have not been issued. This mock
 * provider returns data whose field names, nesting, and batch model
 * exactly match what the real Sunbird API returns, so a future
 * real-credential upgrade requires only swapping this class out —
 * no API-shape changes elsewhere.
 *
 * Key structural fact preserved from the real API:
 *   - A user enrolls in a *batch* (courseId + batchId), not a course.
 *   - Batches have startDate, endDate, enrollmentType.
 *   - Content progress is tracked per-batch via readContentState.
 */

import type {
  CourseBatch,
  ContentState,
  CreateBatchInput,
  IGOTProvider,
  ListBatchesFilter,
  SunbirdEnrollment,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Seed catalogue — iGOT-branded courses with realistic batches
// ─────────────────────────────────────────────────────────────────────────────

interface MockCourse {
  courseId: string;
  title: string;
  description: string;
  batches: CourseBatch[];
  /** content node ids (Sunbird uses do_ prefixed IDs) */
  contentIds: string[];
}

const MOCK_COURSES: MockCourse[] = [
  {
    courseId: "do_igot_python_da_001",
    title: "Python for Data Analysis",
    description:
      "Practical Python for statistical computing, ETL pipelines and data analysis in government statistical offices.",
    contentIds: ["do_igot_python_da_001_c1", "do_igot_python_da_001_c2", "do_igot_python_da_001_c3"],
    batches: [
      {
        batchId: "batch_igot_python_da_2025_jan",
        courseId: "do_igot_python_da_001",
        name: "Python for Data Analysis — Batch Jan 2025",
        description: "Open enrollment batch, self-paced.",
        enrollmentType: "open",
        startDate: "2025-01-06",
        endDate: "2025-06-30",
        status: "ongoing",
        enrollmentEndDate: "2025-06-15",
        dataProvenance: "Mock — shaped to Sunbird API contract",
      },
      {
        batchId: "batch_igot_python_da_2025_sep",
        courseId: "do_igot_python_da_001",
        name: "Python for Data Analysis — Batch Sep 2025",
        description: "Upcoming cohort batch.",
        enrollmentType: "open",
        startDate: "2025-09-01",
        endDate: "2025-12-31",
        status: "upcoming",
        enrollmentEndDate: "2025-11-30",
        dataProvenance: "Mock — shaped to Sunbird API contract",
      },
    ],
  },
  {
    courseId: "do_igot_sql_stats_002",
    title: "SQL for Official Statisticians",
    description:
      "Query design for survey databases, warehouse tables and statistical production systems.",
    contentIds: ["do_igot_sql_stats_002_c1", "do_igot_sql_stats_002_c2"],
    batches: [
      {
        batchId: "batch_igot_sql_2025_mar",
        courseId: "do_igot_sql_stats_002",
        name: "SQL for Official Statisticians — Batch Mar 2025",
        enrollmentType: "open",
        startDate: "2025-03-01",
        endDate: "2025-08-31",
        status: "ongoing",
        enrollmentEndDate: "2025-07-31",
        dataProvenance: "Mock — shaped to Sunbird API contract",
      },
    ],
  },
  {
    courseId: "do_igot_aiml_gov_003",
    title: "Responsible AI for Official Statistics",
    description:
      "Where machine learning can help statistical compilation — and where it must not invent or estimate official figures.",
    contentIds: ["do_igot_aiml_gov_003_c1", "do_igot_aiml_gov_003_c2", "do_igot_aiml_gov_003_c3"],
    batches: [
      {
        batchId: "batch_igot_aiml_2025_q2",
        courseId: "do_igot_aiml_gov_003",
        name: "Responsible AI — Q2 2025 Batch",
        enrollmentType: "open",
        startDate: "2025-04-01",
        endDate: "2025-07-31",
        status: "ongoing",
        dataProvenance: "Mock — shaped to Sunbird API contract",
      },
    ],
  },
  {
    courseId: "do_igot_gis_census_004",
    title: "GIS Fundamentals for Census and Survey Operations",
    description:
      "Geospatial frames, census mapping, coordinate systems and small-area statistical indicators.",
    contentIds: ["do_igot_gis_census_004_c1", "do_igot_gis_census_004_c2"],
    batches: [
      {
        batchId: "batch_igot_gis_2025_jan",
        courseId: "do_igot_gis_census_004",
        name: "GIS Fundamentals — Jan 2025",
        enrollmentType: "invite-only",
        startDate: "2025-01-15",
        endDate: "2025-05-15",
        status: "ongoing",
        dataProvenance: "Mock — shaped to Sunbird API contract",
      },
      {
        batchId: "batch_igot_gis_2025_oct",
        courseId: "do_igot_gis_census_004",
        name: "GIS Fundamentals — Oct 2025",
        enrollmentType: "open",
        startDate: "2025-10-01",
        endDate: "2026-01-31",
        status: "upcoming",
        dataProvenance: "Mock — shaped to Sunbird API contract",
      },
    ],
  },
  {
    courseId: "do_igot_cloud_stats_005",
    title: "Cloud Patterns for Statistical Systems",
    description:
      "Secure, auditable statistical data processing on cloud infrastructure. Covers data residency, audit logs and pipeline security.",
    contentIds: ["do_igot_cloud_stats_005_c1", "do_igot_cloud_stats_005_c2"],
    batches: [
      {
        batchId: "batch_igot_cloud_2025_q1",
        courseId: "do_igot_cloud_stats_005",
        name: "Cloud Patterns — Q1 2025",
        enrollmentType: "open",
        startDate: "2025-02-01",
        endDate: "2025-05-31",
        status: "ongoing",
        dataProvenance: "Mock — shaped to Sunbird API contract",
      },
    ],
  },
  {
    courseId: "do_igot_cyber_microdata_006",
    title: "Microdata Protection and Cyber Hygiene",
    description:
      "Disclosure control, access labs, secure microdata environments and incident response basics for statistical offices.",
    contentIds: ["do_igot_cyber_microdata_006_c1"],
    batches: [
      {
        batchId: "batch_igot_cyber_2025_may",
        courseId: "do_igot_cyber_microdata_006",
        name: "Microdata Protection — May 2025",
        enrollmentType: "open",
        startDate: "2025-05-01",
        endDate: "2025-09-30",
        status: "ongoing",
        dataProvenance: "Mock — shaped to Sunbird API contract",
      },
    ],
  },
];

// In-memory enrollment store for the mock
const MOCK_ENROLLMENTS = new Map<string, SunbirdEnrollment[]>();
let batchCounter = 0;

// ─────────────────────────────────────────────────────────────────────────────
// MockIGOTProvider
// ─────────────────────────────────────────────────────────────────────────────

export class MockIGOTProvider implements IGOTProvider {
  status() {
    return "MOCK — shaped to Sunbird API contract" as const;
  }

  /**
   * POST /api/course/v1/batch/list
   * { "request": { "filters": { "courseId": "..." }, "limit": 2 } }
   */
  async listBatches(filters: ListBatchesFilter): Promise<CourseBatch[]> {
    let batches = MOCK_COURSES.flatMap((course) => course.batches);

    if (filters.courseId) {
      batches = batches.filter((b) => b.courseId === filters.courseId);
    }
    if (filters.status) {
      batches = batches.filter((b) => b.status === filters.status);
    }

    const limit = filters.limit ?? 50;
    return batches.slice(0, limit);
  }

  /**
   * POST /api/course/v1/batch/create
   * { "request": { "courseId": "...", "name": "...", "enrollmentType": "open", ... } }
   */
  async createBatch(input: CreateBatchInput): Promise<CourseBatch> {
    batchCounter += 1;
    const newBatch: CourseBatch = {
      batchId: `batch_mock_created_${Date.now()}_${batchCounter}`,
      courseId: input.courseId,
      name: input.name,
      description: input.description,
      enrollmentType: input.enrollmentType,
      startDate: input.startDate,
      endDate: input.endDate,
      enrollmentEndDate: input.enrollmentEndDate,
      status: "upcoming",
      dataProvenance: "Mock — shaped to Sunbird API contract",
    };
    // Attach to the appropriate course if it exists
    const course = MOCK_COURSES.find((c) => c.courseId === input.courseId);
    if (course) {
      course.batches.push(newBatch);
    }
    return newBatch;
  }

  /**
   * GET /api/course/v1/user/enrollment/list/{userId}
   */
  async getUserEnrollments(userId: string): Promise<SunbirdEnrollment[]> {
    return MOCK_ENROLLMENTS.get(userId) ?? [];
  }

  /**
   * Enroll user in a specific batch.
   * In the real Sunbird API both courseId AND batchId are required.
   */
  async enrollCourse(
    userId: string,
    courseId: string,
    batchId: string,
  ): Promise<SunbirdEnrollment> {
    const existing = (MOCK_ENROLLMENTS.get(userId) ?? []).find(
      (e) => e.courseId === courseId && e.batchId === batchId,
    );
    if (existing) {
      existing.active = true;
      return existing;
    }

    const enrollment: SunbirdEnrollment = {
      courseId,
      batchId,
      userId,
      active: true,
      enrolledDate: new Date().toISOString(),
      completionPercentage: 0,
      status: 0,
    };

    const list = MOCK_ENROLLMENTS.get(userId) ?? [];
    list.push(enrollment);
    MOCK_ENROLLMENTS.set(userId, list);
    return enrollment;
  }

  /**
   * Unenroll user from a specific batch.
   */
  async unenrollCourse(
    userId: string,
    courseId: string,
    batchId: string,
  ): Promise<void> {
    const list = MOCK_ENROLLMENTS.get(userId) ?? [];
    const enrollment = list.find(
      (e) => e.courseId === courseId && e.batchId === batchId,
    );
    if (enrollment) {
      enrollment.active = false;
    }
  }

  /**
   * POST /api/course/v1/content/state/read
   * { "request": { "userId": "...", "courseId": "...", "batchId": "...", "contentIds": [...] } }
   */
  async readContentState(
    userId: string,
    courseId: string,
    batchId: string,
    contentIds: string[],
  ): Promise<ContentState[]> {
    const enrollment = (MOCK_ENROLLMENTS.get(userId) ?? []).find(
      (e) => e.courseId === courseId && e.batchId === batchId,
    );
    return contentIds.map((contentId) => ({
      contentId,
      courseId,
      batchId,
      userId,
      status: enrollment?.active ? 1 : 0,
      lastAccessTime: enrollment?.enrolledDate,
    }));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers for external consumers (sync, catalogue, etc.)
// ─────────────────────────────────────────────────────────────────────────────

/** Returns a flat summary list of all mock courses with their first available batch. */
export function getMockCatalogueSummary() {
  return MOCK_COURSES.map((c) => ({
    courseId: c.courseId,
    title: c.title,
    description: c.description,
    batchCount: c.batches.length,
    activeBatch: c.batches.find((b) => b.status === "ongoing") ?? c.batches[0],
    contentIds: c.contentIds,
    dataProvenance: "Mock — shaped to Sunbird API contract" as const,
  }));
}
