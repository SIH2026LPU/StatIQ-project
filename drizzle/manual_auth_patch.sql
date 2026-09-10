ALTER TABLE "users" ADD COLUMN "username" varchar(64);
ALTER TABLE "users" ADD COLUMN "status" varchar(32) DEFAULT 'ACTIVE' NOT NULL;
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN "mfa_enabled" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN "avatar_url" text;
ALTER TABLE "users" ADD COLUMN "metadata" jsonb;
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");

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

CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text,
	"permissions" jsonb,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);

CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_role_pk" UNIQUE("user_id","role_id")
);

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

CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(128) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verifications_token_unique" UNIQUE("token")
);

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

ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX "user_roles_user_idx" ON "user_roles" USING btree ("user_id");
CREATE INDEX "login_attempts_email_idx" ON "login_attempts" USING btree ("email");
CREATE INDEX "login_attempts_user_idx" ON "login_attempts" USING btree ("user_id");
CREATE INDEX "email_verifications_token_idx" ON "email_verifications" USING btree ("token");
CREATE INDEX "email_verifications_user_idx" ON "email_verifications" USING btree ("user_id");
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens" USING btree ("token");
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens" USING btree ("user_id");
