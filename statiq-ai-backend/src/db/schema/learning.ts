import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  integer,
  numeric,
  boolean,
  pgEnum,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees, jobRoles } from "./org";
import { competencies } from "./competency";

export const courseProviderEnum = pgEnum("course_provider", [
  "INTERNAL",
  "IGOT",
  "NSSTA",
  "TPAC",
  "EXTERNAL",
]);

export const deliveryModeEnum = pgEnum("delivery_mode", [
  "SELF_PACED",
  "INSTRUCTOR_LED",
  "BLENDED",
  "IN_PERSON",
]);

export const difficultyEnum = pgEnum("difficulty", ["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

export const learningBucketEnum = pgEnum("learning_bucket", [
  "DIGITAL_70",
  "ON_JOB_20",
  "CLASSROOM_10",
]);

export const programmeStatusEnum = pgEnum("programme_status", [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "SCHEDULED", // keeping legacy for compat
]);

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    provider: courseProviderEnum("provider").notNull().default("INTERNAL"),
    externalId: varchar("external_id", { length: 255 }), // iGOT/NSSTA course id
    durationHours: numeric("duration_hours", { precision: 6, scale: 2 }),
    difficulty: difficultyEnum("difficulty").default("BEGINNER"),
    language: varchar("language", { length: 20 }).default("en"),
    prerequisites: jsonb("prerequisites").$type<string[]>(),
    sourceUrl: text("source_url"),
    deliveryMode: deliveryModeEnum("delivery_mode").default("SELF_PACED"),
    qualityScore: numeric("quality_score", { precision: 4, scale: 3 }).default("0.700"), // 0-1, feeds recommendation engine
    learningBucket: learningBucketEnum("learning_bucket").default("DIGITAL_70"),
    isAvailable: boolean("is_available").notNull().default(true),
    // provenance (required for every externally-sourced record)
    source: varchar("source", { length: 100 }), // e.g. "iGOT Karmayogi", "NSSTA"
    sourceExternalId: varchar("source_external_id", { length: 255 }),
    retrievedAt: timestamp("retrieved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    providerIdx: index("courses_provider_idx").on(t.provider),
    externalIdx: unique("courses_provider_external_unique").on(t.provider, t.externalId),
  })
);

export const courseCompetencies = pgTable(
  "course_competencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    coverageWeight: numeric("coverage_weight", { precision: 4, scale: 3 }).notNull().default("1.000"),
  },
  (t) => ({
    uniqPair: unique("course_competency_unique").on(t.courseId, t.competencyId),
    courseIdx: index("course_competencies_course_idx").on(t.courseId),
    competencyIdx: index("course_competencies_competency_idx").on(t.competencyId),
  })
);

// NSSTA / TPAC training programmes — distinct from `courses` because they carry
// batch/venue/scheduling data that iGOT courses do not.
export const trainingProgrammes = pgTable(
  "training_programmes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: varchar("source", { length: 20 }).notNull(), // "NSSTA" | "TPAC"
    externalId: varchar("external_id", { length: 255 }),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    trainingType: varchar("training_type", { length: 100 }),
    targetDesignation: varchar("target_designation", { length: 255 }),
    targetDepartment: varchar("target_department", { length: 255 }),
    durationDays: integer("duration_days"),
    deliveryMode: deliveryModeEnum("delivery_mode").default("IN_PERSON"),
    venue: varchar("venue", { length: 255 }),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    priority: integer("priority").default(3), // 1 = highest
    sourceUrl: text("source_url"),
    sourceDocument: text("source_document"),
    status: programmeStatusEnum("status").default("DRAFT"),
    createdByTrainerId: uuid("created_by_trainer_id").references(() => employees.id, { onDelete: "set null" }),
    approvedByAdminId: uuid("approved_by_admin_id").references(() => employees.id, { onDelete: "set null" }),
    approvalNotes: text("approval_notes"),
    decidedAt: timestamp("decided_at"),
    retrievedAt: timestamp("retrieved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    sourceIdx: index("training_programmes_source_idx").on(t.source),
    externalIdx: unique("training_programmes_source_external_unique").on(
      t.source,
      t.externalId
    ),
  })
);

export const programmeCompetencies = pgTable(
  "programme_competencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programmeId: uuid("programme_id")
      .notNull()
      .references(() => trainingProgrammes.id, { onDelete: "cascade" }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    coverageWeight: numeric("coverage_weight", { precision: 4, scale: 3 }).notNull().default("1.000"),
  },
  (t) => ({
    uniqPair: unique("programme_competency_unique").on(t.programmeId, t.competencyId),
  })
);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "ENROLLED",
  "IN_PROGRESS",
  "COMPLETED",
  "DROPPED",
]);

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    status: enrollmentStatusEnum("status").notNull().default("ENROLLED"),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    source: varchar("source", { length: 100 }), // where the enrollment happened (StatIQ / iGOT sync)
  },
  (t) => ({
    uniqPair: unique("enrollment_unique").on(t.employeeId, t.courseId),
    employeeIdx: index("enrollments_employee_idx").on(t.employeeId),
  })
);

export const learningProgress = pgTable(
  "learning_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    completionPercent: integer("completion_percent").notNull().default(0),
    learningHours: numeric("learning_hours", { precision: 6, scale: 2 }).default("0"),
    lastAccessedAt: timestamp("last_accessed_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    enrollmentIdx: unique("learning_progress_enrollment_unique").on(t.enrollmentId),
  })
);

// Explainable recommendations produced by the recommendation engine (see src/lib/recommendation)
export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
    programmeId: uuid("programme_id").references(() => trainingProgrammes.id, {
      onDelete: "cascade",
    }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    score: numeric("score", { precision: 6, scale: 4 }).notNull(),
    scoreBreakdown: jsonb("score_breakdown").$type<{
      gapCoverage: number;
      roleRelevance: number;
      courseQuality: number;
      learningPreference: number;
      departmentPriority: number;
      accessibility: number;
    }>(),
    explanation: text("explanation").notNull(),
    algorithmVersion: varchar("algorithm_version", { length: 20 }).notNull().default("v1"),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
    isDismissed: boolean("is_dismissed").notNull().default(false),
  },
  (t) => ({
    employeeIdx: index("recommendations_employee_idx").on(t.employeeId),
    scoreIdx: index("recommendations_score_idx").on(t.score),
  })
);

export const coursesRelations = relations(courses, ({ many }) => ({
  competencies: many(courseCompetencies),
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  employee: one(employees, { fields: [enrollments.employeeId], references: [employees.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
  progress: many(learningProgress),
}));
