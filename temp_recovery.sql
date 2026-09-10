SET search_path TO recovery; 
CREATE TABLE "ai_generated_questions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"question_id" varchar(64) NOT NULL,
	"validation" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_interactions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"kind" varchar(32) NOT NULL,
	"prompt" text NOT NULL,
	"response" text NOT NULL,
	"sources" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_answers" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"attempt_id" varchar(64) NOT NULL,
	"question_id" varchar(64) NOT NULL,
	"selected_index" integer,
	"is_correct" boolean
);
--> statement-breakpoint
CREATE TABLE "assessment_attempts" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"assessment_id" varchar(64) NOT NULL,
	"employee_id" varchar(64) NOT NULL,
	"score" real,
	"status" varchar(16) NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"question_ids" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"assessment_id" varchar(64) NOT NULL,
	"question_id" varchar(64) NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "assessment_questions_assessment_id_question_id_pk" PRIMARY KEY("assessment_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"competency_id" varchar(64) NOT NULL,
	"course_id" varchar(64),
	"question_count" integer NOT NULL,
	"adaptive" boolean DEFAULT true NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64),
	"user_id" varchar(64),
	"actor_user_id" varchar(64),
	"action" varchar(64) NOT NULL,
	"resource" varchar(64) NOT NULL,
	"resource_id" varchar(64),
	"entity_type" varchar(64),
	"entity_id" varchar(64),
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"employee_id" varchar(64) NOT NULL,
	"course_id" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"issued_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competencies" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"category_id" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"measurement_method" text NOT NULL,
	"default_target_level" real NOT NULL,
	"emerging" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "competency_categories" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "competency_frameworks" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"version" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "competency_history" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"employee_id" varchar(64) NOT NULL,
	"competency_id" varchar(64) NOT NULL,
	"old_score" real NOT NULL,
	"new_score" real NOT NULL,
	"assessment_id" varchar(64),
	"assessment_weight" real NOT NULL,
	"algorithm_version" varchar(16) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_competencies" (
	"course_id" varchar(64) NOT NULL,
	"competency_id" varchar(64) NOT NULL,
	"coverage" real NOT NULL,
	CONSTRAINT "course_competencies_course_id_competency_id_pk" PRIMARY KEY("course_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"provider" varchar(32) NOT NULL,
	"external_id" varchar(128),
	"duration_hours" integer NOT NULL,
	"difficulty" varchar(16) NOT NULL,
	"language" varchar(8) NOT NULL,
	"delivery_mode" varchar(32) NOT NULL,
	"source_url" text,
	"quality_score" real NOT NULL,
	"availability" varchar(16) NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "data_sources" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"organization" text NOT NULL,
	"type" varchar(32) NOT NULL,
	"official_url" text NOT NULL,
	"integration_mode" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"requires_credentials" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_sync_logs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"source" varchar(64) NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone NOT NULL,
	"records_found" integer DEFAULT 0 NOT NULL,
	"records_inserted" integer DEFAULT 0 NOT NULL,
	"records_updated" integer DEFAULT 0 NOT NULL,
	"records_failed" integer DEFAULT 0 NOT NULL,
	"status" varchar(24) NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "dataset_records" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"dataset_id" varchar(64) NOT NULL,
	"source" varchar(128) NOT NULL,
	"source_url" text NOT NULL,
	"external_id" text NOT NULL,
	"retrieved_at" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone,
	"last_updated_at" timestamp with time zone,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"source" varchar(128) NOT NULL,
	"source_url" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"frequency" varchar(64) NOT NULL,
	"reference_period" text NOT NULL,
	"last_updated" timestamp with time zone NOT NULL,
	"record_count" integer DEFAULT 0 NOT NULL,
	"access_type" varchar(32) NOT NULL,
	"theme" varchar(64) NOT NULL,
	"year" varchar(16),
	"external_id" text NOT NULL,
	"retrieved_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"last_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"code" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"document_id" varchar(64) NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"chunk_index" integer NOT NULL,
	"text" text NOT NULL,
	"page" integer,
	"section" text,
	"competency_id" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "document_embeddings" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"chunk_id" varchar(64) NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"model" varchar(128) NOT NULL,
	"embedding" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"course_id" varchar(64),
	"mime_type" varchar(128) NOT NULL,
	"storage_key" text,
	"file_hash" varchar(128),
	"size_bytes" integer,
	"status" varchar(24) NOT NULL,
	"excerpt" text,
	"owner_user_id" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "employee_competencies" (
	"employee_id" varchar(64) NOT NULL,
	"competency_id" varchar(64) NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"score" real NOT NULL,
	"target_score" real NOT NULL,
	"confidence" real NOT NULL,
	"evidence_count" integer DEFAULT 1 NOT NULL,
	"evidence_source" varchar(64) NOT NULL,
	"last_assessed_at" timestamp with time zone,
	"previous_score" real,
	"algorithm_version" varchar(16) DEFAULT 'v1' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employee_competencies_employee_id_competency_id_pk" PRIMARY KEY("employee_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"department_id" varchar(64) NOT NULL,
	"job_role_id" varchar(64) NOT NULL,
	"target_role_id" varchar(64) NOT NULL,
	"user_id" varchar(64),
	"name" text NOT NULL,
	"designation" text NOT NULL,
	"education" text NOT NULL,
	"experience_years" integer NOT NULL,
	"preferred_language" varchar(8) NOT NULL,
	"career_goal" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"employee_id" varchar(64) NOT NULL,
	"course_id" varchar(64) NOT NULL,
	"status" varchar(24) NOT NULL,
	"progress_percent" real NOT NULL,
	"learning_hours" real NOT NULL,
	"enrolled_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"last_accessed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "integration_sources" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"official_url" text NOT NULL,
	"purpose" text NOT NULL,
	"access_model" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_sync_logs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"status" varchar(24) NOT NULL,
	"message" text,
	"retrieved_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_roles" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"family" varchar(64) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "learning_history" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"employee_id" varchar(64) NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"resource_type" varchar(64) NOT NULL,
	"resource_id" varchar(64) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_path_items" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"path_id" varchar(64) NOT NULL,
	"course_id" varchar(64) NOT NULL,
	"sort_order" integer NOT NULL,
	"milestone" text
);
--> statement-breakpoint
CREATE TABLE "learning_paths" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"employee_id" varchar(64) NOT NULL,
	"target_role_id" varchar(64) NOT NULL,
	"goal" text NOT NULL,
	"estimated_hours" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_progress" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"enrollment_id" varchar(64) NOT NULL,
	"employee_id" varchar(64) NOT NULL,
	"course_id" varchar(64) NOT NULL,
	"module_key" varchar(128) NOT NULL,
	"percent" real NOT NULL,
	"time_spent_minutes" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"last_accessed_at" timestamp with time zone NOT NULL,
	"idempotency_key" varchar(128)
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(64),
	"email" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"success" boolean NOT NULL,
	"failure_reason" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mospi_wpi_records" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"source" varchar(64) NOT NULL,
	"external_id" varchar(128),
	"year" integer,
	"month" integer,
	"item" text,
	"value" real,
	"retrieved_at" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone,
	"source_url" text
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"type" varchar(32) NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" varchar(32) NOT NULL,
	"synthetic" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "programme_competencies" (
	"programme_id" varchar(64) NOT NULL,
	"competency_id" varchar(64) NOT NULL,
	"coverage" real NOT NULL,
	CONSTRAINT "programme_competencies_programme_id_competency_id_pk" PRIMARY KEY("programme_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"assessment_id" varchar(64),
	"competency_id" varchar(64) NOT NULL,
	"difficulty" varchar(16) NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL,
	"explanation" text NOT NULL,
	"source_document_id" varchar(64),
	"source_chunk_id" varchar(64),
	"status" varchar(16) NOT NULL,
	"question_type" varchar(24) DEFAULT 'mcq' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"employee_id" varchar(64) NOT NULL,
	"course_id" varchar(64) NOT NULL,
	"score" real NOT NULL,
	"explanation" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_competencies" (
	"role_id" varchar(64) NOT NULL,
	"competency_id" varchar(64) NOT NULL,
	"required_score" real NOT NULL,
	"weight" real NOT NULL,
	"organizational_priority" real NOT NULL,
	CONSTRAINT "role_competencies_role_id_competency_id_pk" PRIMARY KEY("role_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"session_token_hash" text NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"device_name" varchar(128),
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "training_programmes" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"provider" varchar(16) NOT NULL,
	"topic" text NOT NULL,
	"target_designation" text NOT NULL,
	"duration_days" integer NOT NULL,
	"delivery_mode" varchar(32) NOT NULL,
	"source_url" text NOT NULL,
	"year" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"avatar_url" text,
	"phone" varchar(32),
	"bio" text,
	"institution" varchar(128),
	"course" varchar(128),
	"department" varchar(128),
	"year_of_study" integer,
	"state" varchar(64),
	"country" varchar(64),
	"preferences" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" varchar(64) NOT NULL,
	"role_id" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"organization_id" varchar(64) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"employee_id" varchar(64),
	"username" varchar(64),
	"first_name" varchar(128),
	"last_name" varchar(128),
	"display_name" varchar(128),
	"purpose" text,
	"status" varchar(32) DEFAULT 'ACTIVE' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_employee_idx" ON "assessment_attempts" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "competencies_category_idx" ON "competencies" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "courses_provider_idx" ON "courses" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "courses_external_idx" ON "courses" USING btree ("external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dataset_records_source_external_idx" ON "dataset_records" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "dataset_records_dataset_idx" ON "dataset_records" USING btree ("dataset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "datasets_source_external_idx" ON "datasets" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "departments_org_idx" ON "departments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "chunks_document_idx" ON "document_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "email_verifications_user_idx" ON "email_verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_verifications_token_idx" ON "email_verifications" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "emp_comp_employee_idx" ON "employee_competencies" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "emp_comp_competency_idx" ON "employee_competencies" USING btree ("competency_id");--> statement-breakpoint
CREATE INDEX "emp_comp_org_idx" ON "employee_competencies" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "employees_org_idx" ON "employees" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "employees_dept_idx" ON "employees" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "employees_role_idx" ON "employees" USING btree ("job_role_id");--> statement-breakpoint
CREATE INDEX "enrollments_employee_idx" ON "enrollments" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "enrollments_course_idx" ON "enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "progress_employee_idx" ON "learning_progress" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_idempotency_idx" ON "learning_progress" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "login_attempts_email_idx" ON "login_attempts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "login_attempts_user_idx" ON "login_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "questions_assessment_idx" ON "questions" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "recs_employee_idx" ON "recommendations" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "role_comp_role_idx" ON "role_competencies" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("session_token_hash");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_org_idx" ON "users" USING btree ("organization_id");
