import { pgTable, uuid, varchar, text, index, foreignKey, timestamp, unique, integer, numeric, jsonb, boolean, vector, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const askType = pgEnum("ask_type", ['ATTITUDE', 'SKILL', 'KNOWLEDGE'])
export const attemptStatus = pgEnum("attempt_status", ['IN_PROGRESS', 'SUBMITTED', 'EXPIRED'])
export const competencyDomain = pgEnum("competency_domain", ['STATISTICAL', 'TECHNICAL', 'DIGITAL_GOVERNANCE', 'BEHAVIOURAL_MANAGERIAL'])
export const courseProvider = pgEnum("course_provider", ['INTERNAL', 'IGOT', 'NSSTA', 'TPAC', 'EXTERNAL'])
export const deliveryMode = pgEnum("delivery_mode", ['SELF_PACED', 'INSTRUCTOR_LED', 'BLENDED', 'IN_PERSON'])
export const difficulty = pgEnum("difficulty", ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
export const documentStatus = pgEnum("document_status", ['UPLOADED', 'PROCESSING', 'INDEXED', 'FAILED'])
export const enrollmentStatus = pgEnum("enrollment_status", ['ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED'])
export const evidenceType = pgEnum("evidence_type", ['ASSESSMENT', 'CERTIFICATION', 'COURSE_COMPLETION', 'TRAINER_EVALUATION', 'SELF_ASSESSMENT', 'VERIFIED_WORK_EVIDENCE'])
export const learningBucket = pgEnum("learning_bucket", ['DIGITAL_70', 'ON_JOB_20', 'CLASSROOM_10'])
export const programmeStatus = pgEnum("programme_status", ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SCHEDULED'])
export const questionSource = pgEnum("question_source", ['AI_GENERATED', 'MANUAL'])
export const questionType = pgEnum("question_type", ['MCQ', 'TRUE_FALSE', 'SCENARIO'])
export const reviewStatus = pgEnum("review_status", ['PENDING_REVIEW', 'APPROVED', 'REJECTED'])
export const role = pgEnum("role", ['SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER', 'LEARNER', 'CONTENT_MANAGER'])
export const syncStatus = pgEnum("sync_status", ['PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED'])


export const competencyCategories = pgTable("competency_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	domain: competencyDomain().notNull(),
	description: text(),
});

export const jobRoles = pgTable("job_roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	level: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("job_roles_org_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "job_roles_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const departments = pgTable("departments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("departments_org_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "departments_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
]);

export const employeeCompetencies = pgTable("employee_competencies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	employeeId: uuid("employee_id").notNull(),
	competencyId: uuid("competency_id").notNull(),
	currentScore: integer("current_score").default(0).notNull(),
	targetLevel: integer("target_level"),
	confidenceScore: numeric("confidence_score", { precision: 4, scale:  3 }).default('0.500'),
	trend: varchar({ length: 20 }).default('STABLE'),
	lastAssessedAt: timestamp("last_assessed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("employee_competencies_competency_idx").using("btree", table.competencyId.asc().nullsLast().op("uuid_ops")),
	index("employee_competencies_employee_idx").using("btree", table.employeeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employees.id],
			name: "employee_competencies_employee_id_employees_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.competencyId],
			foreignColumns: [competencies.id],
			name: "employee_competencies_competency_id_competencies_id_fk"
		}).onDelete("cascade"),
	unique("employee_competency_unique").on(table.employeeId, table.competencyId),
]);

export const organizations = pgTable("organizations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	parentOrgId: uuid("parent_org_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("organizations_code_unique").on(table.code),
]);

export const employees = pgTable("employees", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	organizationId: uuid("organization_id").notNull(),
	departmentId: uuid("department_id"),
	jobRoleId: uuid("job_role_id"),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	designation: varchar({ length: 255 }),
	currentAssignment: text("current_assignment"),
	education: jsonb(),
	workExperienceYears: varchar("work_experience_years", { length: 20 }),
	previousTrainings: jsonb("previous_trainings"),
	careerGoal: text("career_goal"),
	preferredLanguage: varchar("preferred_language", { length: 20 }).default('en'),
	isSynthetic: boolean("is_synthetic").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("employees_dept_idx").using("btree", table.departmentId.asc().nullsLast().op("uuid_ops")),
	index("employees_org_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("employees_role_idx").using("btree", table.jobRoleId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "employees_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "employees_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "employees_department_id_departments_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.jobRoleId],
			foreignColumns: [jobRoles.id],
			name: "employees_job_role_id_job_roles_id_fk"
		}).onDelete("set null"),
	unique("employees_user_id_unique").on(table.userId),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	role: role().default('LEARNER').notNull(),
	organizationId: uuid("organization_id"),
	isActive: boolean("is_active").default(true).notNull(),
	username: varchar({ length: 64 }).unique(),
	status: varchar({ length: 32 }).default('ACTIVE').notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
	avatarUrl: text("avatar_url"),
	metadata: jsonb(),
	preferredLanguage: varchar("preferred_language", { length: 16 }).default('en'),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("users_org_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("users_role_idx").using("btree", table.role.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "users_organization_id_organizations_id_fk"
		}).onDelete("set null"),
	unique("users_email_unique").on(table.email),
]);

export const roleCompetencies = pgTable("role_competencies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	jobRoleId: uuid("job_role_id").notNull(),
	competencyId: uuid("competency_id").notNull(),
	requiredLevel: integer("required_level").notNull(),
	weight: numeric({ precision: 4, scale:  3 }).default('1.000').notNull(),
	isCritical: integer("is_critical").default(0).notNull(),
}, (table) => [
	index("role_competencies_role_idx").using("btree", table.jobRoleId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.jobRoleId],
			foreignColumns: [jobRoles.id],
			name: "role_competencies_job_role_id_job_roles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.competencyId],
			foreignColumns: [competencies.id],
			name: "role_competencies_competency_id_competencies_id_fk"
		}).onDelete("cascade"),
	unique("role_competency_unique").on(table.jobRoleId, table.competencyId),
]);

export const courseCompetencies = pgTable("course_competencies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	courseId: uuid("course_id").notNull(),
	competencyId: uuid("competency_id").notNull(),
	coverageWeight: numeric("coverage_weight", { precision: 4, scale:  3 }).default('1.000').notNull(),
}, (table) => [
	index("course_competencies_competency_idx").using("btree", table.competencyId.asc().nullsLast().op("uuid_ops")),
	index("course_competencies_course_idx").using("btree", table.courseId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "course_competencies_course_id_courses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.competencyId],
			foreignColumns: [competencies.id],
			name: "course_competencies_competency_id_competencies_id_fk"
		}).onDelete("cascade"),
	unique("course_competency_unique").on(table.courseId, table.competencyId),
]);

export const competencies = pgTable("competencies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	categoryId: uuid("category_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	domain: competencyDomain().notNull(),
	description: text(),
	measurementMethod: varchar("measurement_method", { length: 255 }),
	defaultTargetLevel: integer("default_target_level").default(70).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	askType: askType("ask_type").default('KNOWLEDGE').notNull(),
}, (table) => [
	index("competencies_category_idx").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("competencies_domain_idx").using("btree", table.domain.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [competencyCategories.id],
			name: "competencies_category_id_competency_categories_id_fk"
		}).onDelete("cascade"),
	unique("competencies_name_unique").on(table.name),
]);

export const courses = pgTable("courses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	provider: courseProvider().default('INTERNAL').notNull(),
	externalId: varchar("external_id", { length: 255 }),
	durationHours: numeric("duration_hours", { precision: 6, scale:  2 }),
	difficulty: difficulty().default('BEGINNER'),
	language: varchar({ length: 20 }).default('en'),
	prerequisites: jsonb(),
	sourceUrl: text("source_url"),
	deliveryMode: deliveryMode("delivery_mode").default('SELF_PACED'),
	qualityScore: numeric("quality_score", { precision: 4, scale:  3 }).default('0.700'),
	isAvailable: boolean("is_available").default(true).notNull(),
	source: varchar({ length: 100 }),
	sourceExternalId: varchar("source_external_id", { length: 255 }),
	retrievedAt: timestamp("retrieved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	learningBucket: learningBucket("learning_bucket").default('DIGITAL_70'),
}, (table) => [
	index("courses_provider_idx").using("btree", table.provider.asc().nullsLast().op("enum_ops")),
	unique("courses_provider_external_unique").on(table.provider, table.externalId),
]);

export const learningProgress = pgTable("learning_progress", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	enrollmentId: uuid("enrollment_id").notNull(),
	completionPercent: integer("completion_percent").default(0).notNull(),
	learningHours: numeric("learning_hours", { precision: 6, scale:  2 }).default('0'),
	lastAccessedAt: timestamp("last_accessed_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.enrollmentId],
			foreignColumns: [enrollments.id],
			name: "learning_progress_enrollment_id_enrollments_id_fk"
		}).onDelete("cascade"),
	unique("learning_progress_enrollment_unique").on(table.enrollmentId),
]);

export const programmeCompetencies = pgTable("programme_competencies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	programmeId: uuid("programme_id").notNull(),
	competencyId: uuid("competency_id").notNull(),
	coverageWeight: numeric("coverage_weight", { precision: 4, scale:  3 }).default('1.000').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.programmeId],
			foreignColumns: [trainingProgrammes.id],
			name: "programme_competencies_programme_id_training_programmes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.competencyId],
			foreignColumns: [competencies.id],
			name: "programme_competencies_competency_id_competencies_id_fk"
		}).onDelete("cascade"),
	unique("programme_competency_unique").on(table.programmeId, table.competencyId),
]);

export const recommendations = pgTable("recommendations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	employeeId: uuid("employee_id").notNull(),
	courseId: uuid("course_id"),
	programmeId: uuid("programme_id"),
	competencyId: uuid("competency_id").notNull(),
	score: numeric({ precision: 6, scale:  4 }).notNull(),
	scoreBreakdown: jsonb("score_breakdown"),
	explanation: text().notNull(),
	algorithmVersion: varchar("algorithm_version", { length: 20 }).default('v1').notNull(),
	generatedAt: timestamp("generated_at", { mode: 'string' }).defaultNow().notNull(),
	isDismissed: boolean("is_dismissed").default(false).notNull(),
}, (table) => [
	index("recommendations_employee_idx").using("btree", table.employeeId.asc().nullsLast().op("uuid_ops")),
	index("recommendations_score_idx").using("btree", table.score.asc().nullsLast().op("numeric_ops")),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employees.id],
			name: "recommendations_employee_id_employees_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "recommendations_course_id_courses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.programmeId],
			foreignColumns: [trainingProgrammes.id],
			name: "recommendations_programme_id_training_programmes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.competencyId],
			foreignColumns: [competencies.id],
			name: "recommendations_competency_id_competencies_id_fk"
		}).onDelete("cascade"),
]);

export const assessmentAnswers = pgTable("assessment_answers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	attemptId: uuid("attempt_id").notNull(),
	questionId: uuid("question_id").notNull(),
	selectedOptionId: varchar("selected_option_id", { length: 10 }),
	isCorrect: boolean("is_correct"),
	answeredAt: timestamp("answered_at", { mode: 'string' }).defaultNow().notNull(),
	timeTakenSeconds: integer("time_taken_seconds"),
}, (table) => [
	index("answers_attempt_idx").using("btree", table.attemptId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.attemptId],
			foreignColumns: [assessmentAttempts.id],
			name: "assessment_answers_attempt_id_assessment_attempts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "assessment_answers_question_id_questions_id_fk"
		}).onDelete("cascade"),
]);

export const questions = pgTable("questions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	questionType: questionType("question_type").default('MCQ').notNull(),
	prompt: text().notNull(),
	options: jsonb().notNull(),
	correctOptionId: varchar("correct_option_id", { length: 10 }).notNull(),
	explanation: text().notNull(),
	difficulty: varchar({ length: 20 }).default('INTERMEDIATE').notNull(),
	competencyId: uuid("competency_id").notNull(),
	source: questionSource().default('MANUAL').notNull(),
	sourceDocumentId: uuid("source_document_id"),
	sourceChunkId: uuid("source_chunk_id"),
	qualityScore: numeric("quality_score", { precision: 4, scale:  3 }),
	reviewStatus: reviewStatus("review_status").default('PENDING_REVIEW').notNull(),
	reviewedByEmployeeId: uuid("reviewed_by_employee_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("questions_competency_idx").using("btree", table.competencyId.asc().nullsLast().op("uuid_ops")),
	index("questions_review_idx").using("btree", table.reviewStatus.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.competencyId],
			foreignColumns: [competencies.id],
			name: "questions_competency_id_competencies_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sourceDocumentId],
			foreignColumns: [documents.id],
			name: "questions_source_document_id_documents_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.sourceChunkId],
			foreignColumns: [documentChunks.id],
			name: "questions_source_chunk_id_document_chunks_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.reviewedByEmployeeId],
			foreignColumns: [employees.id],
			name: "questions_reviewed_by_employee_id_employees_id_fk"
		}).onDelete("set null"),
]);

export const assessmentQuestions = pgTable("assessment_questions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	assessmentId: uuid("assessment_id").notNull(),
	questionId: uuid("question_id").notNull(),
	orderIndex: integer("order_index").default(0).notNull(),
}, (table) => [
	index("assessment_questions_assessment_idx").using("btree", table.assessmentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.assessmentId],
			foreignColumns: [assessments.id],
			name: "assessment_questions_assessment_id_assessments_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "assessment_questions_question_id_questions_id_fk"
		}).onDelete("cascade"),
]);

export const assessments = pgTable("assessments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	competencyId: uuid("competency_id"),
	isAdaptive: boolean("is_adaptive").default(false).notNull(),
	timeLimitMinutes: integer("time_limit_minutes"),
	passingScore: integer("passing_score").default(60),
	createdByEmployeeId: uuid("created_by_employee_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("assessments_competency_idx").using("btree", table.competencyId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.competencyId],
			foreignColumns: [competencies.id],
			name: "assessments_competency_id_competencies_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdByEmployeeId],
			foreignColumns: [employees.id],
			name: "assessments_created_by_employee_id_employees_id_fk"
		}).onDelete("set null"),
]);

export const documentChunks = pgTable("document_chunks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid("document_id").notNull(),
	chunkIndex: integer("chunk_index").notNull(),
	content: text().notNull(),
	pageNumber: integer("page_number"),
	section: varchar({ length: 255 }),
	tokenCount: integer("token_count"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("document_chunks_document_idx").using("btree", table.documentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_chunks_document_id_documents_id_fk"
		}).onDelete("cascade"),
]);

export const datagovinRecords = pgTable("datagovin_records", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	resourceId: varchar("resource_id", { length: 100 }).notNull(),
	payload: jsonb().notNull(),
	fetchedAt: timestamp("fetched_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("datagovin_records_resource_idx").using("btree", table.resourceId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.resourceId],
			foreignColumns: [datagovinResources.resourceId],
			name: "datagovin_records_resource_id_datagovin_resources_resource_id_f"
		}).onDelete("cascade"),
]);

export const esankhyikiIndicators = pgTable("esankhyiki_indicators", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	datasetId: uuid("dataset_id").notNull(),
	indicatorName: varchar("indicator_name", { length: 255 }).notNull(),
	period: varchar({ length: 50 }),
	geography: varchar({ length: 100 }),
	value: numeric({ precision: 14, scale:  4 }),
	unit: varchar({ length: 50 }),
	metadata: jsonb(),
	source: varchar({ length: 100 }).default('eSankhyiki'),
	fetchedAt: timestamp("fetched_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("esankhyiki_indicators_dataset_idx").using("btree", table.datasetId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.datasetId],
			foreignColumns: [esankhyikiDatasets.id],
			name: "esankhyiki_indicators_dataset_id_esankhyiki_datasets_id_fk"
		}).onDelete("cascade"),
]);

export const unitdataFiles = pgTable("unitdata_files", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	datasetId: uuid("dataset_id").notNull(),
	fileName: varchar("file_name", { length: 500 }).notNull(),
	format: varchar({ length: 20 }),
	sizeBytes: integer("size_bytes"),
	downloadUrl: text("download_url"),
	checksum: varchar({ length: 64 }),
}, (table) => [
	index("unitdata_files_dataset_idx").using("btree", table.datasetId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.datasetId],
			foreignColumns: [unitdataDatasets.id],
			name: "unitdata_files_dataset_id_unitdata_datasets_id_fk"
		}).onDelete("cascade"),
]);

export const aiInteractions = pgTable("ai_interactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	employeeId: uuid("employee_id"),
	interactionType: varchar("interaction_type", { length: 50 }).notNull(),
	prompt: text(),
	retrievedChunkIds: jsonb("retrieved_chunk_ids"),
	response: text(),
	model: varchar({ length: 100 }),
	latencyMs: integer("latency_ms"),
	tokensUsed: integer("tokens_used"),
	flaggedForInjection: integer("flagged_for_injection").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ai_interactions_employee_idx").using("btree", table.employeeId.asc().nullsLast().op("uuid_ops")),
	index("ai_interactions_type_idx").using("btree", table.interactionType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employees.id],
			name: "ai_interactions_employee_id_employees_id_fk"
		}).onDelete("set null"),
]);

export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	uploadedByEmployeeId: uuid("uploaded_by_employee_id"),
	title: varchar({ length: 500 }).notNull(),
	fileType: varchar("file_type", { length: 20 }).notNull(),
	fileHash: varchar("file_hash", { length: 64 }).notNull(),
	mimeType: varchar("mime_type", { length: 100 }),
	sizeBytes: integer("size_bytes"),
	storageKey: text("storage_key").notNull(),
	accessScope: varchar("access_scope", { length: 30 }).default('ORGANIZATION').notNull(),
	competencyId: uuid("competency_id"),
	status: documentStatus().default('UPLOADED').notNull(),
	processingError: text("processing_error"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("documents_org_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("documents_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "documents_organization_id_organizations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.uploadedByEmployeeId],
			foreignColumns: [employees.id],
			name: "documents_uploaded_by_employee_id_employees_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.competencyId],
			foreignColumns: [competencies.id],
			name: "documents_competency_id_competencies_id_fk"
		}).onDelete("set null"),
]);

export const datagovinResources = pgTable("datagovin_resources", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	resourceId: varchar("resource_id", { length: 100 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	sector: varchar({ length: 255 }),
	orgName: varchar("org_name", { length: 255 }),
	recordCount: integer("record_count"),
	fields: jsonb(),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }),
}, (table) => [
	index("datagovin_resources_sector_idx").using("btree", table.sector.asc().nullsLast().op("text_ops")),
	unique("datagovin_resources_resource_id_unique").on(table.resourceId),
]);

export const esankhyikiDatasets = pgTable("esankhyiki_datasets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	externalId: varchar("external_id", { length: 255 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	category: varchar({ length: 255 }),
	frequency: varchar({ length: 100 }),
	unit: varchar({ length: 100 }),
	publisher: varchar({ length: 255 }).default('MoSPI'),
	sourceUrl: text("source_url"),
	apiAvailable: boolean("api_available").default(false).notNull(),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }),
}, (table) => [
	index("esankhyiki_datasets_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	unique("esankhyiki_datasets_external_id_unique").on(table.externalId),
]);

export const dataSourceRegistry = pgTable("data_source_registry", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	source: varchar({ length: 100 }).notNull(),
	officialUrl: text("official_url").notNull(),
	purpose: text(),
	access: varchar({ length: 100 }),
	integrationMode: varchar("integration_mode", { length: 20 }).default('mock').notNull(),
	notes: text(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	unique("data_source_registry_source_unique").on(table.source),
]);

export const documentEmbeddings = pgTable("document_embeddings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chunkId: uuid("chunk_id").notNull(),
	embedding: jsonb("embedding"),
	embeddingModel: varchar("embedding_model", { length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("document_embeddings_chunk_idx").using("btree", table.chunkId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.chunkId],
			foreignColumns: [documentChunks.id],
			name: "document_embeddings_chunk_id_document_chunks_id_fk"
		}).onDelete("cascade"),
	unique("document_embeddings_chunk_id_unique").on(table.chunkId),
]);

export const integrationSyncLogs = pgTable("integration_sync_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	source: varchar({ length: 100 }).notNull(),
	resource: varchar({ length: 255 }),
	status: syncStatus().default('PENDING').notNull(),
	recordsFetched: integer("records_fetched").default(0),
	recordsUpserted: integer("records_upserted").default(0),
	errorMessage: text("error_message"),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow().notNull(),
	finishedAt: timestamp("finished_at", { mode: 'string' }),
}, (table) => [
	index("sync_logs_source_idx").using("btree", table.source.asc().nullsLast().op("text_ops")),
	index("sync_logs_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
]);

export const mospiWpiRecords = pgTable("mospi_wpi_records", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	year: integer().notNull(),
	month: integer().notNull(),
	majorGroup: varchar("major_group", { length: 255 }),
	groupName: varchar("group_name", { length: 255 }),
	subgroup: varchar({ length: 255 }),
	item: varchar({ length: 255 }),
	value: numeric({ precision: 12, scale:  4 }),
	unit: varchar({ length: 50 }),
	source: varchar({ length: 100 }).default('MoSPI WPI API').notNull(),
	fetchedAt: timestamp("fetched_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("wpi_period_idx").using("btree", table.year.asc().nullsLast().op("int4_ops"), table.month.asc().nullsLast().op("int4_ops")),
	unique("wpi_unique_record").on(table.year, table.month, table.majorGroup, table.groupName, table.subgroup, table.item),
]);

export const unitdataDatasets = pgTable("unitdata_datasets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	externalId: varchar("external_id", { length: 255 }).notNull(),
	name: varchar({ length: 500 }).notNull(),
	surveyRound: varchar("survey_round", { length: 100 }),
	description: text(),
	sourceUrl: text("source_url"),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }),
}, (table) => [
	unique("unitdata_datasets_external_id_unique").on(table.externalId),
]);

export const competencyScoreHistory = pgTable("competency_score_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	employeeCompetencyId: uuid("employee_competency_id").notNull(),
	oldScore: integer("old_score").notNull(),
	newScore: integer("new_score").notNull(),
	evidenceType: evidenceType("evidence_type").notNull(),
	evidenceRefId: uuid("evidence_ref_id"),
	assessmentWeight: numeric("assessment_weight", { precision: 4, scale:  3 }),
	algorithmVersion: varchar("algorithm_version", { length: 20 }).default('v1').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("score_history_ec_idx").using("btree", table.employeeCompetencyId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.employeeCompetencyId],
			foreignColumns: [employeeCompetencies.id],
			name: "competency_score_history_employee_competency_id_employee_compet"
		}).onDelete("cascade"),
]);

export const enrollments = pgTable("enrollments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	employeeId: uuid("employee_id").notNull(),
	courseId: uuid("course_id").notNull(),
	status: enrollmentStatus().default('ENROLLED').notNull(),
	enrolledAt: timestamp("enrolled_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	source: varchar({ length: 100 }),
}, (table) => [
	index("enrollments_employee_idx").using("btree", table.employeeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employees.id],
			name: "enrollments_employee_id_employees_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "enrollments_course_id_courses_id_fk"
		}).onDelete("cascade"),
	unique("enrollment_unique").on(table.employeeId, table.courseId),
]);

export const assessmentAttempts = pgTable("assessment_attempts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	assessmentId: uuid("assessment_id").notNull(),
	employeeId: uuid("employee_id").notNull(),
	status: attemptStatus().default('IN_PROGRESS').notNull(),
	scorePercent: integer("score_percent"),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow().notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	questionSequence: jsonb("question_sequence"),
}, (table) => [
	index("attempts_assessment_idx").using("btree", table.assessmentId.asc().nullsLast().op("uuid_ops")),
	index("attempts_employee_idx").using("btree", table.employeeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.assessmentId],
			foreignColumns: [assessments.id],
			name: "assessment_attempts_assessment_id_assessments_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employees.id],
			name: "assessment_attempts_employee_id_employees_id_fk"
		}).onDelete("cascade"),
]);

export const activityCompetencies = pgTable("activity_competencies", {
	activityId: uuid("activity_id").notNull(),
	competencyId: uuid("competency_id").notNull(),
	requiredLevel: integer("required_level").notNull(),
}, (table) => [
	index("activity_competencies_activity_idx").using("btree", table.activityId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.activityId],
			foreignColumns: [activities.id],
			name: "activity_competencies_activity_id_activities_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.competencyId],
			foreignColumns: [competencies.id],
			name: "activity_competencies_competency_id_competencies_id_fk"
		}).onDelete("cascade"),
	unique("activity_competency_pk").on(table.activityId, table.competencyId),
]);

export const activities = pgTable("activities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	jobRoleId: uuid("job_role_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
}, (table) => [
	index("activities_role_idx").using("btree", table.jobRoleId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.jobRoleId],
			foreignColumns: [jobRoles.id],
			name: "activities_job_role_id_job_roles_id_fk"
		}).onDelete("cascade"),
]);

export const mospiStatisticalRecords = pgTable("mospi_statistical_records", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	datasetId: uuid("dataset_id").notNull(),
	indicatorCode: varchar("indicator_code", { length: 255 }),
	indicatorName: varchar("indicator_name", { length: 500 }),
	period: varchar({ length: 100 }),
	geography: varchar({ length: 255 }),
	category: varchar({ length: 255 }),
	value: numeric({ precision: 16, scale:  4 }),
	unit: varchar({ length: 100 }),
	rawData: jsonb("raw_data"),
	source: varchar({ length: 255 }).default('MoSPI e-Sankhyiki'),
	fetchedAt: timestamp("fetched_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("mospi_records_dataset_idx").using("btree", table.datasetId.asc().nullsLast().op("uuid_ops")),
	index("mospi_records_indicator_idx").using("btree", table.indicatorCode.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.datasetId],
			foreignColumns: [mospiDatasets.id],
			name: "mospi_statistical_records_dataset_id_mospi_datasets_id_fk"
		}).onDelete("cascade"),
]);

export const trainingProgrammes = pgTable("training_programmes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	source: varchar({ length: 20 }).notNull(),
	externalId: varchar("external_id", { length: 255 }),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	trainingType: varchar("training_type", { length: 100 }),
	targetDesignation: varchar("target_designation", { length: 255 }),
	targetDepartment: varchar("target_department", { length: 255 }),
	durationDays: integer("duration_days"),
	deliveryMode: deliveryMode("delivery_mode").default('IN_PERSON'),
	venue: varchar({ length: 255 }),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	priority: integer().default(3),
	sourceUrl: text("source_url"),
	sourceDocument: text("source_document"),
	status: programmeStatus().default('DRAFT'),
	retrievedAt: timestamp("retrieved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdByTrainerId: uuid("created_by_trainer_id"),
	approvedByAdminId: uuid("approved_by_admin_id"),
	approvalNotes: text("approval_notes"),
	decidedAt: timestamp("decided_at", { mode: 'string' }),
}, (table) => [
	index("training_programmes_source_idx").using("btree", table.source.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdByTrainerId],
			foreignColumns: [employees.id],
			name: "training_programmes_created_by_trainer_id_employees_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.approvedByAdminId],
			foreignColumns: [employees.id],
			name: "training_programmes_approved_by_admin_id_employees_id_fk"
		}).onDelete("set null"),
	unique("training_programmes_source_external_unique").on(table.source, table.externalId),
]);

export const sessions = pgTable("sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
}, (table) => [
	index("sessions_token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("sessions_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("sessions_token_unique").on(table.token),
]);

export const mospiDatasets = pgTable("mospi_datasets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 500 }).notNull(),
	description: text(),
	source: varchar({ length: 255 }).default('MoSPI e-Sankhyiki').notNull(),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }),
	status: varchar({ length: 50 }).default('ACTIVE'),
}, (table) => [
	unique("mospi_datasets_code_unique").on(table.code),
]);

export const mospiDatasetSyncs = pgTable("mospi_dataset_syncs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	datasetId: uuid("dataset_id").notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	status: syncStatus().default('PENDING').notNull(),
	recordsFetched: integer("records_fetched").default(0),
	errorMessage: text("error_message"),
}, (table) => [
	index("mospi_syncs_dataset_idx").using("btree", table.datasetId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.datasetId],
			foreignColumns: [mospiDatasets.id],
			name: "mospi_dataset_syncs_dataset_id_mospi_datasets_id_fk"
		}).onDelete("cascade"),
]);
export const datasets = pgTable("datasets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  sourceUrl: text("source_url"),
  category: varchar("category", { length: 128 }),
  description: text("description"),
  frequency: varchar("frequency", { length: 64 }),
  referencePeriod: varchar("reference_period", { length: 128 }),
  lastUpdated: timestamp("last_updated", { withTimezone: true }),
  recordCount: integer("record_count"),
  accessType: varchar("access_type", { length: 64 }),
  theme: varchar("theme", { length: 128 }),
  year: varchar("year", { length: 64 }),
  externalId: varchar("external_id", { length: 255 }),
});

export const datasetRecords = pgTable("dataset_records", {
  id: varchar("id", { length: 64 }).primaryKey(),
  datasetId: varchar("dataset_id", { length: 64 }).notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  sourceUrl: text("source_url"),
  externalId: varchar("external_id", { length: 255 }),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  payload: jsonb("payload"),
});

export const dataSyncLogs = pgTable("data_sync_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  source: varchar("source", { length: 64 }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  recordsFound: integer("records_found"),
  recordsInserted: integer("records_inserted"),
  recordsUpdated: integer("records_updated"),
  recordsFailed: integer("records_failed"),
  status: varchar("status", { length: 64 }),
  error: text("error"),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 32 }),
  dateOfBirth: timestamp("date_of_birth", { mode: 'string' }),
  addressLine1: varchar("address_line1", { length: 255 }),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 128 }),
  country: varchar("country", { length: 128 }),
  postalCode: varchar("postal_code", { length: 32 }),
  languagePreference: varchar("language_preference", { length: 16 }),
  timezone: varchar("timezone", { length: 64 }),
  bio: text("bio"),
});

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions"),
});

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  index("user_roles_user_idx").using("btree", t.userId),
  unique("user_role_pk").on(t.userId, t.roleId),
]);



export const loginAttempts = pgTable("login_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'set null' }),
  email: varchar("email", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  failureReason: varchar("failure_reason", { length: 64 }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  index("login_attempts_email_idx").using("btree", t.email),
  index("login_attempts_user_idx").using("btree", t.userId),
]);

export const emailVerifications = pgTable("email_verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
  verifiedAt: timestamp("verified_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  index("email_verifications_token_idx").using("btree", t.token),
  index("email_verifications_user_idx").using("btree", t.userId),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
  usedAt: timestamp("used_at", { mode: 'string' }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  index("password_reset_tokens_token_idx").using("btree", t.token),
  index("password_reset_tokens_user_idx").using("btree", t.userId),
]);

export const translationCache = pgTable("translation_cache", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceTextHash: varchar("source_text_hash", { length: 64 }).notNull(),
  sourceLanguage: varchar("source_language", { length: 16 }).notNull(),
  targetLanguage: varchar("target_language", { length: 16 }).notNull(),
  sourceType: varchar("source_type", { length: 32 }).notNull(),
  translatedText: text("translated_text").notNull(),
  provider: varchar("provider", { length: 32 }).notNull(),
  providerVersion: varchar("provider_version", { length: 64 }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  unique("translation_cache_unique_idx").on(
    t.sourceTextHash, t.sourceLanguage, t.targetLanguage, t.sourceType, t.providerVersion
  ),
  index("translation_cache_hash_idx").using("btree", t.sourceTextHash),
]);

export const learnerProfiles = pgTable("learner_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	fullName: varchar("full_name", { length: 255 }),
	phone: varchar({ length: 50 }),
	employeeId: varchar("employee_id", { length: 100 }),
	organization: varchar({ length: 255 }),
	ministry: varchar({ length: 255 }),
	department: varchar({ length: 255 }),
	division: varchar({ length: 255 }),
	designation: varchar({ length: 255 }),
	jobRole: varchar("job_role", { length: 255 }),
	yearsExperience: integer("years_experience"),
	state: varchar({ length: 100 }),
	highestQualification: varchar("highest_qualification", { length: 255 }),
	specialization: varchar({ length: 255 }),
	currentResponsibilities: text("current_responsibilities"),
	profileCompleted: boolean("profile_completed").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("learner_profiles_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "learner_profiles_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("learner_profiles_user_id_unique").on(table.userId),
]);

export const learnerSkills = pgTable("learner_skills", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	learnerProfileId: uuid("learner_profile_id").notNull(),
	skillName: varchar("skill_name", { length: 255 }).notNull(),
	skillCategory: varchar("skill_category", { length: 100 }),
	selfRating: varchar("self_rating", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("learner_skills_profile_idx").using("btree", table.learnerProfileId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.learnerProfileId],
			foreignColumns: [learnerProfiles.id],
			name: "learner_skills_learner_profile_id_learner_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const careerGoals = pgTable("career_goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	learnerProfileId: uuid("learner_profile_id").notNull(),
	targetRole: varchar("target_role", { length: 255 }),
	goalDescription: text("goal_description"),
	priority: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.learnerProfileId],
			foreignColumns: [learnerProfiles.id],
			name: "career_goals_learner_profile_id_learner_profiles_id_fk"
		}).onDelete("cascade"),
	unique("career_goals_learner_profile_id_unique").on(table.learnerProfileId),
]);

export const learningPreferences = pgTable("learning_preferences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	learnerProfileId: uuid("learner_profile_id").notNull(),
	language: varchar({ length: 50 }),
	contentType: varchar("content_type", { length: 100 }),
	difficulty: varchar({ length: 50 }),
	weeklyHours: integer("weekly_hours"),
	learningFormat: varchar("learning_format", { length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.learnerProfileId],
			foreignColumns: [learnerProfiles.id],
			name: "learning_preferences_profile_id_learner_profiles_id_fk"
		}).onDelete("cascade"),
	unique("learning_preferences_learner_profile_id_unique").on(table.learnerProfileId),
]);
