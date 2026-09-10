/**
 * OfficialIGOTProvider — Real Sunbird API adapter
 *
 * ACTIVATION: Set all three env vars:
 *   IGOT_PROVIDER=official
 *   IGOT_API_BASE_URL=https://<sunbird-instance>
 *   IGOT_API_KEY=<your-api-key>
 *
 * Without real credentials this provider FAILS LOUDLY — it does NOT silently
 * fall back to mock. The provider factory handles the mode switch.
 *
 * Endpoint shapes match the official Sunbird API contract:
 *   POST /api/course/v1/batch/list
 *   POST /api/course/v1/batch/create
 *   GET  /api/course/v1/user/enrollment/list/{userId}
 *   POST /api/course/v1/content/state/read
 */

import type {
  CourseBatch,
  ContentState,
  CreateBatchInput,
  IGOTProvider,
  ListBatchesFilter,
  SunbirdEnrollment,
} from "./types";

export class OfficialIGOTProvider implements IGOTProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly authToken: string;

  constructor() {
    this.baseUrl = process.env.IGOT_API_BASE_URL ?? "";
    this.apiKey = process.env.IGOT_API_KEY ?? "";
    this.authToken = process.env.IGOT_USER_AUTH_TOKEN ?? "";

    if (!this.baseUrl || !this.apiKey) {
      throw new Error(
        "[OfficialIGOTProvider] IGOT_API_BASE_URL and IGOT_API_KEY are required. " +
          "Set IGOT_PROVIDER=official only when real Sunbird credentials are available.",
      );
    }
  }

  status() {
    return "LIVE" as const;
  }

  private headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.apiKey,
      ...(this.authToken ? { "x-authenticated-user-token": this.authToken } : {}),
    };
  }

  async listBatches(filters: ListBatchesFilter): Promise<CourseBatch[]> {
    const res = await fetch(`${this.baseUrl}/api/course/v1/batch/list`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        request: {
          filters: {
            ...(filters.courseId ? { courseId: filters.courseId } : {}),
            ...(filters.status ? { status: filters.status } : {}),
          },
          limit: filters.limit ?? 20,
        },
      }),
    });
    if (!res.ok) throw new Error(`[iGOT] batch/list HTTP ${res.status}`);
    const json = await res.json();
    // Sunbird wraps results in result.response.content
    const items: any[] = json?.result?.response?.content ?? [];
    return items.map((item) => ({
      batchId: item.id ?? item.batchId,
      courseId: item.courseId,
      name: item.name,
      description: item.description,
      enrollmentType: item.enrollmentType === "invite-only" ? "invite-only" : "open",
      startDate: item.startDate,
      endDate: item.endDate,
      enrollmentEndDate: item.enrollmentEndDate,
      status: item.status === 1 ? "ongoing" : item.status === 2 ? "expired" : "upcoming",
      dataProvenance: "Mock — shaped to Sunbird API contract",
    }));
  }

  async createBatch(input: CreateBatchInput): Promise<CourseBatch> {
    const res = await fetch(`${this.baseUrl}/api/course/v1/batch/create`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        request: {
          courseId: input.courseId,
          name: input.name,
          description: input.description,
          enrollmentType: input.enrollmentType,
          startDate: input.startDate,
          endDate: input.endDate,
          enrollmentEndDate: input.enrollmentEndDate,
        },
      }),
    });
    if (!res.ok) throw new Error(`[iGOT] batch/create HTTP ${res.status}`);
    const json = await res.json();
    const batch = json?.result?.response;
    return {
      batchId: batch.batchId,
      courseId: input.courseId,
      name: input.name,
      description: input.description,
      enrollmentType: input.enrollmentType,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "upcoming",
      dataProvenance: "Mock — shaped to Sunbird API contract",
    };
  }

  async getUserEnrollments(userId: string): Promise<SunbirdEnrollment[]> {
    const res = await fetch(
      `${this.baseUrl}/api/course/v1/user/enrollment/list/${encodeURIComponent(userId)}`,
      { headers: this.headers() },
    );
    if (!res.ok) throw new Error(`[iGOT] enrollment/list HTTP ${res.status}`);
    const json = await res.json();
    const courses: any[] = json?.result?.courses ?? [];
    return courses.map((c) => ({
      courseId: c.courseId,
      batchId: c.batchId,
      userId,
      active: c.active ?? true,
      enrolledDate: c.enrolledDate ?? new Date().toISOString(),
      completionPercentage: c.completionPercentage ?? 0,
      status: c.status ?? 0,
      certificates: c.certificates,
    }));
  }

  async enrollCourse(
    userId: string,
    courseId: string,
    batchId: string,
  ): Promise<SunbirdEnrollment> {
    const res = await fetch(`${this.baseUrl}/api/course/v1/enrol`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        request: { courseId, userId, batchId },
      }),
    });
    if (!res.ok) throw new Error(`[iGOT] enrol HTTP ${res.status}`);
    return {
      courseId,
      batchId,
      userId,
      active: true,
      enrolledDate: new Date().toISOString(),
      completionPercentage: 0,
      status: 0,
    };
  }

  async unenrollCourse(
    userId: string,
    courseId: string,
    batchId: string,
  ): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/course/v1/unenrol`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        request: { courseId, userId, batchId },
      }),
    });
    if (!res.ok) throw new Error(`[iGOT] unenrol HTTP ${res.status}`);
  }

  async readContentState(
    userId: string,
    courseId: string,
    batchId: string,
    contentIds: string[],
  ): Promise<ContentState[]> {
    const res = await fetch(`${this.baseUrl}/api/course/v1/content/state/read`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        request: { userId, courseId, batchId, contentIds },
      }),
    });
    if (!res.ok) throw new Error(`[iGOT] content/state/read HTTP ${res.status}`);
    const json = await res.json();
    const items: any[] = json?.result?.contentList ?? [];
    return items.map((item) => ({
      contentId: item.contentId,
      courseId,
      batchId,
      userId,
      status: item.status ?? 0,
      score: item.score,
      lastAccessTime: item.lastAccessTime,
    }));
  }
}
