import { integer, pgTable, real, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  name: text("name").notNull(),
  employeeId: varchar("employee_id", { length: 64 }),
});

export const employees = pgTable("employees", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 64 }).notNull(),
  departmentId: varchar("department_id", { length: 64 }).notNull(),
  jobRoleId: varchar("job_role_id", { length: 64 }).notNull(),
  targetRoleId: varchar("target_role_id", { length: 64 }).notNull(),
  name: text("name").notNull(),
});

export const competencies = pgTable("competencies", {
  id: varchar("id", { length: 64 }).primaryKey(),
  categoryId: varchar("category_id", { length: 64 }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const employeeCompetencies = pgTable("employee_competencies", {
  employeeId: varchar("employee_id", { length: 64 }).notNull(),
  competencyId: varchar("competency_id", { length: 64 }).notNull(),
  score: real("score").notNull(),
  lastAssessedAt: timestamp("last_assessed_at"),
  evidenceSource: varchar("evidence_source", { length: 64 }).notNull(),
});

export const courses = pgTable("courses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  provider: varchar("provider", { length: 32 }).notNull(),
  durationHours: integer("duration_hours").notNull(),
  source: varchar("source", { length: 64 }),
  externalId: varchar("external_id", { length: 128 }),
  sourceUrl: text("source_url"),
});

export const documentChunks = pgTable("document_chunks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  documentId: varchar("document_id", { length: 64 }).notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  text: text("text").notNull(),
  competencyId: varchar("competency_id", { length: 64 }),
});
