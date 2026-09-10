CREATE TYPE "public"."ask_type" AS ENUM('ATTITUDE', 'SKILL', 'KNOWLEDGE');--> statement-breakpoint
CREATE TYPE "public"."attempt_status" AS ENUM('IN_PROGRESS', 'SUBMITTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."competency_domain" AS ENUM('STATISTICAL', 'TECHNICAL', 'DIGITAL_GOVERNANCE', 'BEHAVIOURAL_MANAGERIAL');--> statement-breakpoint
CREATE TYPE "public"."course_provider" AS ENUM('INTERNAL', 'IGOT', 'NSSTA', 'TPAC', 'EXTERNAL');--> statement-breakpoint
CREATE TYPE "public"."delivery_mode" AS ENUM('SELF_PACED', 'INSTRUCTOR_LED', 'BLENDED', 'IN_PERSON');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('UPLOADED', 'PROCESSING', 'INDEXED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED');--> statement-breakpoint
CREATE TYPE "public"."evidence_type" AS ENUM('ASSESSMENT', 'CERTIFICATION', 'COURSE_COMPLETION', 'TRAINER_EVALUATION', 'SELF_ASSESSMENT', 'VERIFIED_WORK_EVIDENCE');--> statement-breakpoint
CREATE TYPE "public"."learning_bucket" AS ENUM('DIGITAL_70', 'ON_JOB_20', 'CLASSROOM_10');--> statement-breakpoint
CREATE TYPE "public"."programme_status" AS ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SCHEDULED');--> statement-breakpoint
CREATE TYPE "public"."question_source" AS ENUM('AI_GENERATED', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('MCQ', 'TRUE_FALSE', 'SCENARIO');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER', 'LEARNER', 'CONTENT_MANAGER');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_role_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "activity_competencies" (
	"activity_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"required_level" integer NOT NULL,
	CONSTRAINT "activity_competency_pk" UNIQUE("activity_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE "ai_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid,
	"interaction_type" varchar(50) NOT NULL,
	"prompt" text,
	"retrieved_chunk_ids" jsonb,
	"response" text,
	"model" varchar(100),
	"latency_ms" integer,
	"tokens_used" integer,
	"flagged_for_injection" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" varchar(10),
	"is_correct" boolean,
	"answered_at" timestamp DEFAULT now() NOT NULL,
	"time_taken_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "assessment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"status" "attempt_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"score_percent" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"question_sequence" jsonb
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"competency_id" uuid,
	"is_adaptive" boolean DEFAULT false NOT NULL,
	"time_limit_minutes" integer,
	"passing_score" integer DEFAULT 60,
	"created_by_employee_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" "competency_domain" NOT NULL,
	"description" text,
	"measurement_method" varchar(255),
	"default_target_level" integer DEFAULT 70 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ask_type" "ask_type" DEFAULT 'KNOWLEDGE' NOT NULL,
	CONSTRAINT "competencies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "competency_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" "competency_domain" NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "competency_score_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_competency_id" uuid NOT NULL,
	"old_score" integer NOT NULL,
	"new_score" integer NOT NULL,
	"evidence_type" "evidence_type" NOT NULL,
	"evidence_ref_id" uuid,
	"assessment_weight" numeric(4, 3),
	"algorithm_version" varchar(20) DEFAULT 'v1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"coverage_weight" numeric(4, 3) DEFAULT '1.000' NOT NULL,
	CONSTRAINT "course_competency_unique" UNIQUE("course_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"provider" "course_provider" DEFAULT 'INTERNAL' NOT NULL,
	"external_id" varchar(255),
	"duration_hours" numeric(6, 2),
	"difficulty" "difficulty" DEFAULT 'BEGINNER',
	"language" varchar(20) DEFAULT 'en',
	"prerequisites" jsonb,
	"source_url" text,
	"delivery_mode" "delivery_mode" DEFAULT 'SELF_PACED',
	"quality_score" numeric(4, 3) DEFAULT '0.700',
	"is_available" boolean DEFAULT true NOT NULL,
	"source" varchar(100),
	"source_external_id" varchar(255),
	"retrieved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"learning_bucket" "learning_bucket" DEFAULT 'DIGITAL_70',
	CONSTRAINT "courses_provider_external_unique" UNIQUE("provider","external_id")
);
--> statement-breakpoint
CREATE TABLE "data_source_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(100) NOT NULL,
	"official_url" text NOT NULL,
	"purpose" text,
	"access" varchar(100),
	"integration_mode" varchar(20) DEFAULT 'mock' NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "data_source_registry_source_unique" UNIQUE("source")
);
--> statement-breakpoint
CREATE TABLE "data_sync_logs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"source" varchar(64) NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"records_found" integer,
	"records_inserted" integer,
	"records_updated" integer,
	"records_failed" integer,
	"status" varchar(64),
	"error" text
);
--> statement-breakpoint
CREATE TABLE "datagovin_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datagovin_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" varchar(100) NOT NULL,
	"title" varchar(500) NOT NULL,
	"sector" varchar(255),
	"org_name" varchar(255),
	"record_count" integer,
	"fields" jsonb,
	"last_synced_at" timestamp,
	CONSTRAINT "datagovin_resources_resource_id_unique" UNIQUE("resource_id")
);
--> statement-breakpoint
CREATE TABLE "dataset_records" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"dataset_id" varchar(64) NOT NULL,
	"source" varchar(64) NOT NULL,
	"source_url" text,
	"external_id" varchar(255),
	"retrieved_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"payload" jsonb
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"source" varchar(64) NOT NULL,
	"source_url" text,
	"category" varchar(128),
	"description" text,
	"frequency" varchar(64),
	"reference_period" varchar(128),
	"last_updated" timestamp with time zone,
	"record_count" integer,
	"access_type" varchar(64),
	"theme" varchar(128),
	"year" varchar(64),
	"external_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"page_number" integer,
	"section" varchar(255),
	"token_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chunk_id" uuid NOT NULL,
	"embedding" vector(1536),
	"embedding_model" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_embeddings_chunk_id_unique" UNIQUE("chunk_id")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"uploaded_by_employee_id" uuid,
	"title" varchar(500) NOT NULL,
	"file_type" varchar(20) NOT NULL,
	"file_hash" varchar(64) NOT NULL,
	"mime_type" varchar(100),
	"size_bytes" integer,
	"storage_key" text NOT NULL,
	"access_scope" varchar(30) DEFAULT 'ORGANIZATION' NOT NULL,
	"competency_id" uuid,
	"status" "document_status" DEFAULT 'UPLOADED' NOT NULL,
	"processing_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(128) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verifications_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "employee_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"current_score" integer DEFAULT 0 NOT NULL,
	"target_level" integer,
	"confidence_score" numeric(4, 3) DEFAULT '0.500',
	"trend" varchar(20) DEFAULT 'STABLE',
	"last_assessed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_competency_unique" UNIQUE("employee_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"department_id" uuid,
	"job_role_id" uuid,
	"full_name" varchar(255) NOT NULL,
	"designation" varchar(255),
	"current_assignment" text,
	"education" jsonb,
	"work_experience_years" varchar(20),
	"previous_trainings" jsonb,
	"career_goal" text,
	"preferred_language" varchar(20) DEFAULT 'en',
	"is_synthetic" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"status" "enrollment_status" DEFAULT 'ENROLLED' NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"source" varchar(100),
	CONSTRAINT "enrollment_unique" UNIQUE("employee_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "esankhyiki_datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"category" varchar(255),
	"frequency" varchar(100),
	"unit" varchar(100),
	"publisher" varchar(255) DEFAULT 'MoSPI',
	"source_url" text,
	"api_available" boolean DEFAULT false NOT NULL,
	"last_synced_at" timestamp,
	CONSTRAINT "esankhyiki_datasets_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "esankhyiki_indicators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"indicator_name" varchar(255) NOT NULL,
	"period" varchar(50),
	"geography" varchar(100),
	"value" numeric(14, 4),
	"unit" varchar(50),
	"metadata" jsonb,
	"source" varchar(100) DEFAULT 'eSankhyiki',
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(100) NOT NULL,
	"resource" varchar(255),
	"status" "sync_status" DEFAULT 'PENDING' NOT NULL,
	"records_fetched" integer DEFAULT 0,
	"records_upserted" integer DEFAULT 0,
	"error_message" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "job_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"level" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"completion_percent" integer DEFAULT 0 NOT NULL,
	"learning_hours" numeric(6, 2) DEFAULT '0',
	"last_accessed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "learning_progress_enrollment_unique" UNIQUE("enrollment_id")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"success" boolean NOT NULL,
	"failure_reason" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mospi_dataset_syncs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"status" "sync_status" DEFAULT 'PENDING' NOT NULL,
	"records_fetched" integer DEFAULT 0,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "mospi_datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(255) NOT NULL,
	"name" varchar(500) NOT NULL,
	"description" text,
	"source" varchar(255) DEFAULT 'MoSPI e-Sankhyiki' NOT NULL,
	"last_synced_at" timestamp,
	"status" varchar(50) DEFAULT 'ACTIVE',
	CONSTRAINT "mospi_datasets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "mospi_statistical_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"indicator_code" varchar(255),
	"indicator_name" varchar(500),
	"period" varchar(100),
	"geography" varchar(255),
	"category" varchar(255),
	"value" numeric(16, 4),
	"unit" varchar(100),
	"raw_data" jsonb,
	"source" varchar(255) DEFAULT 'MoSPI e-Sankhyiki',
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mospi_wpi_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"major_group" varchar(255),
	"group_name" varchar(255),
	"subgroup" varchar(255),
	"item" varchar(255),
	"value" numeric(12, 4),
	"unit" varchar(50),
	"source" varchar(100) DEFAULT 'MoSPI WPI API' NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wpi_unique_record" UNIQUE("year","month","major_group","group_name","subgroup","item")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"parent_org_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(128) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "programme_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programme_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"coverage_weight" numeric(4, 3) DEFAULT '1.000' NOT NULL,
	CONSTRAINT "programme_competency_unique" UNIQUE("programme_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_type" "question_type" DEFAULT 'MCQ' NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_id" varchar(10) NOT NULL,
	"explanation" text NOT NULL,
	"difficulty" varchar(20) DEFAULT 'INTERMEDIATE' NOT NULL,
	"competency_id" uuid NOT NULL,
	"source" "question_source" DEFAULT 'MANUAL' NOT NULL,
	"source_document_id" uuid,
	"source_chunk_id" uuid,
	"quality_score" numeric(4, 3),
	"review_status" "review_status" DEFAULT 'PENDING_REVIEW' NOT NULL,
	"reviewed_by_employee_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"course_id" uuid,
	"programme_id" uuid,
	"competency_id" uuid NOT NULL,
	"score" numeric(6, 4) NOT NULL,
	"score_breakdown" jsonb,
	"explanation" text NOT NULL,
	"algorithm_version" varchar(20) DEFAULT 'v1' NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"is_dismissed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_role_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"required_level" integer NOT NULL,
	"weight" numeric(4, 3) DEFAULT '1.000' NOT NULL,
	"is_critical" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "role_competency_unique" UNIQUE("job_role_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text,
	"permissions" jsonb,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "training_programmes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(20) NOT NULL,
	"external_id" varchar(255),
	"title" varchar(500) NOT NULL,
	"description" text,
	"training_type" varchar(100),
	"target_designation" varchar(255),
	"target_department" varchar(255),
	"duration_days" integer,
	"delivery_mode" "delivery_mode" DEFAULT 'IN_PERSON',
	"venue" varchar(255),
	"start_date" timestamp,
	"end_date" timestamp,
	"priority" integer DEFAULT 3,
	"source_url" text,
	"source_document" text,
	"status" "programme_status" DEFAULT 'DRAFT',
	"retrieved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_trainer_id" uuid,
	"approved_by_admin_id" uuid,
	"approval_notes" text,
	"decided_at" timestamp,
	CONSTRAINT "training_programmes_source_external_unique" UNIQUE("source","external_id")
);
--> statement-breakpoint
CREATE TABLE "unitdata_datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"name" varchar(500) NOT NULL,
	"survey_round" varchar(100),
	"description" text,
	"source_url" text,
	"last_synced_at" timestamp,
	CONSTRAINT "unitdata_datasets_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "unitdata_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"format" varchar(20),
	"size_bytes" integer,
	"download_url" text,
	"checksum" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"phone_number" varchar(32),
	"date_of_birth" timestamp,
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(128),
	"state" varchar(128),
	"country" varchar(128),
	"postal_code" varchar(32),
	"language_preference" varchar(16),
	"timezone" varchar(64),
	"bio" text
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_role_pk" UNIQUE("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'LEARNER' NOT NULL,
	"organization_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"username" varchar(64),
	"status" varchar(32) DEFAULT 'ACTIVE' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"avatar_url" text,
	"metadata" jsonb,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_job_role_id_job_roles_id_fk" FOREIGN KEY ("job_role_id") REFERENCES "public"."job_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_competencies" ADD CONSTRAINT "activity_competencies_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_competencies" ADD CONSTRAINT "activity_competencies_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_created_by_employee_id_employees_id_fk" FOREIGN KEY ("created_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competencies" ADD CONSTRAINT "competencies_category_id_competency_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."competency_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_score_history" ADD CONSTRAINT "competency_score_history_employee_competency_id_employee_compet" FOREIGN KEY ("employee_competency_id") REFERENCES "public"."employee_competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_competencies" ADD CONSTRAINT "course_competencies_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_competencies" ADD CONSTRAINT "course_competencies_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datagovin_records" ADD CONSTRAINT "datagovin_records_resource_id_datagovin_resources_resource_id_f" FOREIGN KEY ("resource_id") REFERENCES "public"."datagovin_resources"("resource_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_embeddings" ADD CONSTRAINT "document_embeddings_chunk_id_document_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."document_chunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_employee_id_employees_id_fk" FOREIGN KEY ("uploaded_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_competencies" ADD CONSTRAINT "employee_competencies_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_competencies" ADD CONSTRAINT "employee_competencies_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_job_role_id_job_roles_id_fk" FOREIGN KEY ("job_role_id") REFERENCES "public"."job_roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "esankhyiki_indicators" ADD CONSTRAINT "esankhyiki_indicators_dataset_id_esankhyiki_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."esankhyiki_datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_roles" ADD CONSTRAINT "job_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mospi_dataset_syncs" ADD CONSTRAINT "mospi_dataset_syncs_dataset_id_mospi_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."mospi_datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mospi_statistical_records" ADD CONSTRAINT "mospi_statistical_records_dataset_id_mospi_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."mospi_datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_competencies" ADD CONSTRAINT "programme_competencies_programme_id_training_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."training_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_competencies" ADD CONSTRAINT "programme_competencies_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_source_document_id_documents_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_source_chunk_id_document_chunks_id_fk" FOREIGN KEY ("source_chunk_id") REFERENCES "public"."document_chunks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_reviewed_by_employee_id_employees_id_fk" FOREIGN KEY ("reviewed_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_programme_id_training_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."training_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_competencies" ADD CONSTRAINT "role_competencies_job_role_id_job_roles_id_fk" FOREIGN KEY ("job_role_id") REFERENCES "public"."job_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_competencies" ADD CONSTRAINT "role_competencies_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_programmes" ADD CONSTRAINT "training_programmes_created_by_trainer_id_employees_id_fk" FOREIGN KEY ("created_by_trainer_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_programmes" ADD CONSTRAINT "training_programmes_approved_by_admin_id_employees_id_fk" FOREIGN KEY ("approved_by_admin_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unitdata_files" ADD CONSTRAINT "unitdata_files_dataset_id_unitdata_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."unitdata_datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_role_idx" ON "activities" USING btree ("job_role_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "activity_competencies_activity_idx" ON "activity_competencies" USING btree ("activity_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "ai_interactions_employee_idx" ON "ai_interactions" USING btree ("employee_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "ai_interactions_type_idx" ON "ai_interactions" USING btree ("interaction_type" text_ops);--> statement-breakpoint
CREATE INDEX "answers_attempt_idx" ON "assessment_answers" USING btree ("attempt_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "attempts_assessment_idx" ON "assessment_attempts" USING btree ("assessment_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "attempts_employee_idx" ON "assessment_attempts" USING btree ("employee_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "assessment_questions_assessment_idx" ON "assessment_questions" USING btree ("assessment_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "assessments_competency_idx" ON "assessments" USING btree ("competency_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "competencies_category_idx" ON "competencies" USING btree ("category_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "competencies_domain_idx" ON "competencies" USING btree ("domain" enum_ops);--> statement-breakpoint
CREATE INDEX "score_history_ec_idx" ON "competency_score_history" USING btree ("employee_competency_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "course_competencies_competency_idx" ON "course_competencies" USING btree ("competency_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "course_competencies_course_idx" ON "course_competencies" USING btree ("course_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "courses_provider_idx" ON "courses" USING btree ("provider" enum_ops);--> statement-breakpoint
CREATE INDEX "datagovin_records_resource_idx" ON "datagovin_records" USING btree ("resource_id" text_ops);--> statement-breakpoint
CREATE INDEX "datagovin_resources_sector_idx" ON "datagovin_resources" USING btree ("sector" text_ops);--> statement-breakpoint
CREATE INDEX "departments_org_idx" ON "departments" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "document_chunks_document_idx" ON "document_chunks" USING btree ("document_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "document_embeddings_chunk_idx" ON "document_embeddings" USING btree ("chunk_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "documents_org_idx" ON "documents" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "email_verifications_token_idx" ON "email_verifications" USING btree ("token");--> statement-breakpoint
CREATE INDEX "email_verifications_user_idx" ON "email_verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "employee_competencies_competency_idx" ON "employee_competencies" USING btree ("competency_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "employee_competencies_employee_idx" ON "employee_competencies" USING btree ("employee_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "employees_dept_idx" ON "employees" USING btree ("department_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "employees_org_idx" ON "employees" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "employees_role_idx" ON "employees" USING btree ("job_role_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "enrollments_employee_idx" ON "enrollments" USING btree ("employee_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "esankhyiki_datasets_category_idx" ON "esankhyiki_datasets" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "esankhyiki_indicators_dataset_idx" ON "esankhyiki_indicators" USING btree ("dataset_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "sync_logs_source_idx" ON "integration_sync_logs" USING btree ("source" text_ops);--> statement-breakpoint
CREATE INDEX "sync_logs_status_idx" ON "integration_sync_logs" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "job_roles_org_idx" ON "job_roles" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "login_attempts_email_idx" ON "login_attempts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "login_attempts_user_idx" ON "login_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mospi_syncs_dataset_idx" ON "mospi_dataset_syncs" USING btree ("dataset_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "mospi_records_dataset_idx" ON "mospi_statistical_records" USING btree ("dataset_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "mospi_records_indicator_idx" ON "mospi_statistical_records" USING btree ("indicator_code" text_ops);--> statement-breakpoint
CREATE INDEX "wpi_period_idx" ON "mospi_wpi_records" USING btree ("year" int4_ops,"month" int4_ops);--> statement-breakpoint
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "questions_competency_idx" ON "questions" USING btree ("competency_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "questions_review_idx" ON "questions" USING btree ("review_status" enum_ops);--> statement-breakpoint
CREATE INDEX "recommendations_employee_idx" ON "recommendations" USING btree ("employee_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "recommendations_score_idx" ON "recommendations" USING btree ("score" numeric_ops);--> statement-breakpoint
CREATE INDEX "role_competencies_role_idx" ON "role_competencies" USING btree ("job_role_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "training_programmes_source_idx" ON "training_programmes" USING btree ("source" text_ops);--> statement-breakpoint
CREATE INDEX "unitdata_files_dataset_idx" ON "unitdata_files" USING btree ("dataset_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "user_roles_user_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_org_idx" ON "users" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role" enum_ops);