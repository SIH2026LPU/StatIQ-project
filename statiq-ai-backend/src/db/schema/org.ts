import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", [
  "SUPER_ADMIN",
  "ORG_ADMIN",
  "TRAINER",
  "LEARNER",
  "CONTENT_MANAGER",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(), // e.g. "MOSPI"
  parentOrgId: uuid("parent_org_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(), // e.g. "DIID"
    code: varchar("code", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("departments_org_idx").on(t.organizationId),
  })
);

export const jobRoles = pgTable(
  "job_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(), // e.g. "Assistant Director (Statistics)"
    description: text("description"),
    level: varchar("level", { length: 50 }), // Junior / Mid / Senior / Leadership
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("job_roles_org_idx").on(t.organizationId),
  })
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull().default("LEARNER"),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("users_org_idx").on(t.organizationId),
    roleIdx: index("users_role_idx").on(t.role),
  })
);

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    jobRoleId: uuid("job_role_id").references(() => jobRoles.id, {
      onDelete: "set null",
    }),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    designation: varchar("designation", { length: 255 }),
    currentAssignment: text("current_assignment"),
    education: jsonb("education").$type<
      { degree: string; field: string; institution: string; year?: number }[]
    >(),
    workExperienceYears: varchar("work_experience_years", { length: 20 }),
    previousTrainings: jsonb("previous_trainings").$type<string[]>(),
    careerGoal: text("career_goal"),
    preferredLanguage: varchar("preferred_language", { length: 20 }).default("en"),
    isSynthetic: boolean("is_synthetic").notNull().default(true), // demo/seed data flag
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("employees_org_idx").on(t.organizationId),
    deptIdx: index("employees_dept_idx").on(t.departmentId),
    roleIdx: index("employees_role_idx").on(t.jobRoleId),
  })
);

export const organizationsRelations = relations(organizations, ({ many }) => ({
  departments: many(departments),
  jobRoles: many(jobRoles),
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
  user: one(users, { fields: [employees.userId], references: [users.id] }),
  organization: one(organizations, {
    fields: [employees.organizationId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  jobRole: one(jobRoles, { fields: [employees.jobRoleId], references: [jobRoles.id] }),
}));

// FRAC: Activities
export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobRoleId: uuid("job_role_id")
      .notNull()
      .references(() => jobRoles.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(), // e.g. "Design and pilot a household survey"
    description: text("description"),
  },
  (t) => ({
    roleIdx: index("activities_role_idx").on(t.jobRoleId),
  })
);

export const activitiesRelations = relations(activities, ({ one }) => ({
  jobRole: one(jobRoles, { fields: [activities.jobRoleId], references: [jobRoles.id] }),
}));

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
  },
  (t) => ({
    userIdx: index("sessions_user_idx").on(t.userId),
    tokenIdx: index("sessions_token_idx").on(t.token),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));
