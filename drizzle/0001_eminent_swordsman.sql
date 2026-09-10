CREATE TABLE "translation_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_text_hash" varchar(64) NOT NULL,
	"source_language" varchar(16) NOT NULL,
	"target_language" varchar(16) NOT NULL,
	"source_type" varchar(32) NOT NULL,
	"translated_text" text NOT NULL,
	"provider" varchar(32) NOT NULL,
	"provider_version" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "translation_cache_unique_idx" UNIQUE("source_text_hash","source_language","target_language","source_type","provider_version")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "preferred_language" varchar(16) DEFAULT 'en';--> statement-breakpoint
CREATE INDEX "translation_cache_hash_idx" ON "translation_cache" USING btree ("source_text_hash");