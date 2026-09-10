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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees } from "./org";
import { competencies } from "./competency";
import { documents, documentChunks } from "./rag";

export const questionTypeEnum = pgEnum("question_type", [
  "MCQ",
  "TRUE_FALSE",
  "SCENARIO",
]);

export const questionSourceEnum = pgEnum("question_source", ["AI_GENERATED", "MANUAL"]);
export const reviewStatusEnum = pgEnum("review_status", [
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
]);

export const assessments = pgTable(
  "assessments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    competencyId: uuid("competency_id").references(() => competencies.id, {
      onDelete: "set null",
    }),
    isAdaptive: boolean("is_adaptive").notNull().default(false),
    timeLimitMinutes: integer("time_limit_minutes"),
    passingScore: integer("passing_score").default(60),
    createdByEmployeeId: uuid("created_by_employee_id").references(() => employees.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    competencyIdx: index("assessments_competency_idx").on(t.competencyId),
  })
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionType: questionTypeEnum("question_type").notNull().default("MCQ"),
    prompt: text("prompt").notNull(),
    options: jsonb("options").$type<{ id: string; text: string }[]>().notNull(),
    correctOptionId: varchar("correct_option_id", { length: 10 }).notNull(),
    explanation: text("explanation").notNull(),
    difficulty: varchar("difficulty", { length: 20 }).notNull().default("INTERMEDIATE"),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    source: questionSourceEnum("source").notNull().default("MANUAL"),
    // Grounding — required for AI-generated questions per FR-17
    sourceDocumentId: uuid("source_document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    sourceChunkId: uuid("source_chunk_id").references(() => documentChunks.id, {
      onDelete: "set null",
    }),
    qualityScore: numeric("quality_score", { precision: 4, scale: 3 }),
    reviewStatus: reviewStatusEnum("review_status").notNull().default("PENDING_REVIEW"),
    reviewedByEmployeeId: uuid("reviewed_by_employee_id").references(() => employees.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    competencyIdx: index("questions_competency_idx").on(t.competencyId),
    reviewIdx: index("questions_review_idx").on(t.reviewStatus),
  })
);

export const assessmentQuestions = pgTable(
  "assessment_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull().default(0),
  },
  (t) => ({
    assessmentIdx: index("assessment_questions_assessment_idx").on(t.assessmentId),
  })
);

export const attemptStatusEnum = pgEnum("attempt_status", [
  "IN_PROGRESS",
  "SUBMITTED",
  "EXPIRED",
]);

export const assessmentAttempts = pgTable(
  "assessment_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    status: attemptStatusEnum("status").notNull().default("IN_PROGRESS"),
    scorePercent: integer("score_percent"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),
    // audit trail of adaptive question order shown, per FR-19
    questionSequence: jsonb("question_sequence").$type<string[]>(),
  },
  (t) => ({
    employeeIdx: index("attempts_employee_idx").on(t.employeeId),
    assessmentIdx: index("attempts_assessment_idx").on(t.assessmentId),
  })
);

export const assessmentAnswers = pgTable(
  "assessment_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => assessmentAttempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    selectedOptionId: varchar("selected_option_id", { length: 10 }),
    isCorrect: boolean("is_correct"),
    answeredAt: timestamp("answered_at").defaultNow().notNull(),
    timeTakenSeconds: integer("time_taken_seconds"),
  },
  (t) => ({
    attemptIdx: index("answers_attempt_idx").on(t.attemptId),
  })
);

export const assessmentsRelations = relations(assessments, ({ many }) => ({
  questions: many(assessmentQuestions),
  attempts: many(assessmentAttempts),
}));

export const assessmentAttemptsRelations = relations(assessmentAttempts, ({ one, many }) => ({
  assessment: one(assessments, {
    fields: [assessmentAttempts.assessmentId],
    references: [assessments.id],
  }),
  employee: one(employees, {
    fields: [assessmentAttempts.employeeId],
    references: [employees.id],
  }),
  answers: many(assessmentAnswers),
}));
