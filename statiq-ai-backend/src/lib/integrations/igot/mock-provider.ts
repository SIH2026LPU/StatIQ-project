import type {
  IGOTProvider,
  ExternalCourse,
  CourseFilters,
  Enrollment,
  CourseProgress,
  CompletionStatus,
} from "../types";

/**
 * MockIGOTProvider — used until IGOT_API_BASE_URL / IGOT_API_KEY are officially
 * issued (see IGOT_INTEGRATION_MODE in .env.example). Swap for OfficialIGOTProvider
 * in provider-factory.ts once credentials exist; no other code changes.
 */
const MOCK_CATALOGUE: ExternalCourse[] = [
  {
    externalId: "igot-python-data-analysis",
    title: "Python for Data Analysis",
    description:
      "Hands-on introduction to pandas, numpy and data cleaning for official statistics workflows.",
    competencyTags: ["Python", "Data Analysis", "Data Visualization"],
    durationHours: 12,
    difficulty: "BEGINNER",
    language: "en",
    sourceUrl: "https://www.igotkarmayogi.gov.in/course/python-for-data-analysis",
    qualityScore: 0.86,
  },
  {
    externalId: "igot-sql-for-statisticians",
    title: "SQL for Statisticians",
    description: "Querying, joining and aggregating statistical datasets using SQL.",
    competencyTags: ["SQL", "Data Quality Frameworks"],
    durationHours: 8,
    difficulty: "BEGINNER",
    language: "en",
    sourceUrl: "https://www.igotkarmayogi.gov.in/course/sql-for-statisticians",
    qualityScore: 0.81,
  },
  {
    externalId: "igot-gis-fundamentals",
    title: "GIS Fundamentals for Survey Data",
    description: "Applying GIS to spatial statistics, sampling frames and survey design.",
    competencyTags: ["GIS", "Survey Design", "Sampling"],
    durationHours: 10,
    difficulty: "INTERMEDIATE",
    language: "en",
    sourceUrl: "https://www.igotkarmayogi.gov.in/course/gis-fundamentals",
    qualityScore: 0.78,
  },
  {
    externalId: "igot-ml-for-official-statistics",
    title: "Machine Learning for Official Statistics",
    description: "Applying ML/AI techniques to survey imputation, classification and forecasting.",
    competencyTags: ["AI/ML", "Data Quality Frameworks", "Cloud Computing"],
    durationHours: 16,
    difficulty: "ADVANCED",
    language: "en",
    sourceUrl: "https://www.igotkarmayogi.gov.in/course/ml-official-statistics",
    qualityScore: 0.83,
  },
  {
    externalId: "igot-cloud-computing-govt",
    title: "Cloud Computing for Government Services",
    description: "Fundamentals of government cloud, deployment models and data residency.",
    competencyTags: ["Cloud Computing", "Government Cloud", "Cybersecurity"],
    durationHours: 6,
    difficulty: "BEGINNER",
    language: "en",
    sourceUrl: "https://www.igotkarmayogi.gov.in/course/cloud-computing-govt",
    qualityScore: 0.74,
  },
  {
    externalId: "igot-data-privacy-dpi",
    title: "Data Privacy & Digital Public Infrastructure",
    description: "Data protection principles, DPI concepts and secure data exchange for officials.",
    competencyTags: ["Data Privacy", "Digital Public Infrastructure", "Cybersecurity"],
    durationHours: 5,
    difficulty: "BEGINNER",
    language: "en",
    sourceUrl: "https://www.igotkarmayogi.gov.in/course/data-privacy-dpi",
    qualityScore: 0.79,
  },
  {
    externalId: "igot-national-accounts-101",
    title: "Introduction to National Accounts",
    description: "Core concepts of GDP compilation, national income accounting and SNA framework.",
    competencyTags: ["National Accounts", "SDG Indicators"],
    durationHours: 14,
    difficulty: "INTERMEDIATE",
    language: "en",
    sourceUrl: "https://www.igotkarmayogi.gov.in/course/national-accounts-101",
    qualityScore: 0.88,
  },
  {
    externalId: "igot-leadership-public-sector",
    title: "Leadership & Change Management in Public Sector",
    description: "Behavioural and managerial competencies for officials moving into leadership roles.",
    competencyTags: ["Leadership", "Change Management", "Decision Making"],
    durationHours: 9,
    difficulty: "INTERMEDIATE",
    language: "en",
    sourceUrl: "https://www.igotkarmayogi.gov.in/course/leadership-public-sector",
    qualityScore: 0.76,
  },
];

export class MockIGOTProvider implements IGOTProvider {
  async searchCourses(query: string, filters?: CourseFilters): Promise<ExternalCourse[]> {
    const q = query.toLowerCase().trim();
    return MOCK_CATALOGUE.filter((c) => {
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.competencyTags.some((t) => t.toLowerCase().includes(q));
      const matchesCompetency =
        !filters?.competency ||
        c.competencyTags.some(
          (t) => t.toLowerCase() === filters.competency!.toLowerCase()
        );
      const matchesDifficulty = !filters?.difficulty || c.difficulty === filters.difficulty;
      return matchesQuery && matchesCompetency && matchesDifficulty;
    });
  }

  async getCourse(courseId: string): Promise<ExternalCourse | null> {
    return MOCK_CATALOGUE.find((c) => c.externalId === courseId) ?? null;
  }

  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    return {
      externalId: `mock-enr-${userId}-${courseId}`,
      userId,
      courseId,
      status: "ENROLLED",
      enrolledAt: new Date().toISOString(),
    };
  }

  async getProgress(userId: string, courseId: string): Promise<CourseProgress> {
    return { courseId, userId, completionPercent: 0, lastAccessedAt: new Date().toISOString() };
  }

  async getCompletion(userId: string, courseId: string): Promise<CompletionStatus> {
    return { courseId, userId, isComplete: false };
  }
}

export function getMockCatalogue(): ExternalCourse[] {
  return MOCK_CATALOGUE;
}
