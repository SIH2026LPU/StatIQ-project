import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  integer,
  numeric,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees, jobRoles, activities } from "./org";

export const competencyDomainEnum = pgEnum("competency_domain", [
  "STATISTICAL",
  "TECHNICAL",
  "DIGITAL_GOVERNANCE",
  "BEHAVIOURAL_MANAGERIAL",
]);

export const askTypeEnum = pgEnum("ask_type", [
  "ATTITUDE",
  "SKILL",
  "KNOWLEDGE",
]);

export const evidenceTypeEnum = pgEnum("evidence_type", [
  "ASSESSMENT",
  "CERTIFICATION",
  "COURSE_COMPLETION",
  "TRAINER_EVALUATION",
  "SELF_ASSESSMENT",
  "VERIFIED_WORK_EVIDENCE",
]);

export const competencyCategories = pgTable("competency_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: competencyDomainEnum("domain").notNull(),
  description: text("description"),
});

export const competencies = pgTable(
  "competencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => competencyCategories.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(), // e.g. "Survey Design", "Python"
    domain: competencyDomainEnum("domain").notNull(),
    askType: askTypeEnum("ask_type").notNull().default("KNOWLEDGE"),
    description: text("description"),
    measurementMethod: varchar("measurement_method", { length: 255 }),
    defaultTargetLevel: integer("default_target_level").notNull().default(70), // 0-100
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: unique("competencies_name_unique").on(t.name),
    categoryIdx: index("competencies_category_idx").on(t.categoryId),
    domainIdx: index("competencies_domain_idx").on(t.domain),
  })
);

// FRAC: Activity-Competency Requirements
export const activityCompetencies = pgTable(
  "activity_competencies",
  {
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    requiredLevel: integer("required_level").notNull(), // 0-100
  },
  (t) => ({
    pk: unique("activity_competency_pk").on(t.activityId, t.competencyId),
    activityIdx: index("activity_competencies_activity_idx").on(t.activityId),
  })
);

// Competency requirements per job role — drives skill-gap + readiness calculations
export const roleCompetencies = pgTable(
  "role_competencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobRoleId: uuid("job_role_id")
      .notNull()
      .references(() => jobRoles.id, { onDelete: "cascade" }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    requiredLevel: integer("required_level").notNull(), // 0-100
    weight: numeric("weight", { precision: 4, scale: 3 }).notNull().default("1.000"), // relative importance
    isCritical: integer("is_critical").notNull().default(0), // 0/1 — critical gaps surfaced separately
  },
  (t) => ({
    uniqPair: unique("role_competency_unique").on(t.jobRoleId, t.competencyId),
    roleIdx: index("role_competencies_role_idx").on(t.jobRoleId),
  })
);

// Current scored competency per employee, with full audit trail via competency_score_history
export const employeeCompetencies = pgTable(
  "employee_competencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    currentScore: integer("current_score").notNull().default(0), // 0-100
    targetLevel: integer("target_level"), // overrides competency default if set
    confidenceScore: numeric("confidence_score", { precision: 4, scale: 3 }).default("0.500"),
    trend: varchar("trend", { length: 20 }).default("STABLE"), // IMPROVING / STABLE / DECLINING
    lastAssessedAt: timestamp("last_assessed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqPair: unique("employee_competency_unique").on(t.employeeId, t.competencyId),
    employeeIdx: index("employee_competencies_employee_idx").on(t.employeeId),
    competencyIdx: index("employee_competencies_competency_idx").on(t.competencyId),
  })
);

// Immutable audit trail: every competency score change, with the evidence and algorithm version
export const competencyScoreHistory = pgTable(
  "competency_score_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeCompetencyId: uuid("employee_competency_id")
      .notNull()
      .references(() => employeeCompetencies.id, { onDelete: "cascade" }),
    oldScore: integer("old_score").notNull(),
    newScore: integer("new_score").notNull(),
    evidenceType: evidenceTypeEnum("evidence_type").notNull(),
    evidenceRefId: uuid("evidence_ref_id"), // e.g. assessment_attempts.id
    assessmentWeight: numeric("assessment_weight", { precision: 4, scale: 3 }),
    algorithmVersion: varchar("algorithm_version", { length: 20 }).notNull().default("v1"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    ecIdx: index("score_history_ec_idx").on(t.employeeCompetencyId),
  })
);

export const competenciesRelations = relations(competencies, ({ one, many }) => ({
  category: one(competencyCategories, {
    fields: [competencies.categoryId],
    references: [competencyCategories.id],
  }),
  roleCompetencies: many(roleCompetencies),
  employeeCompetencies: many(employeeCompetencies),
  activityCompetencies: many(activityCompetencies),
}));

export const activityCompetenciesRelations = relations(activityCompetencies, ({ one }) => ({
  activity: one(activities, {
    fields: [activityCompetencies.activityId],
    references: [activities.id],
  }),
  competency: one(competencies, {
    fields: [activityCompetencies.competencyId],
    references: [competencies.id],
  }),
}));

export const employeeCompetenciesRelations = relations(employeeCompetencies, ({ one, many }) => ({
  employee: one(employees, {
    fields: [employeeCompetencies.employeeId],
    references: [employees.id],
  }),
  competency: one(competencies, {
    fields: [employeeCompetencies.competencyId],
    references: [competencies.id],
  }),
  history: many(competencyScoreHistory),
}));
