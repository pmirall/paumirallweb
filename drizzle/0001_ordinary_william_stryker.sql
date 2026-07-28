CREATE TYPE "public"."asset_visibility" AS ENUM('private', 'client', 'public');--> statement-breakpoint
CREATE TYPE "public"."derive_status" AS ENUM('pending', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."queue_job_status" AS ENUM('pending', 'running', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."queue_status" AS ENUM('pending', 'enriched', 'ignored', 'container');--> statement-breakpoint
CREATE TABLE "drive_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drive_folder_id" text NOT NULL,
	"name" text NOT NULL,
	"parent_drive_id" text,
	"path" text,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"file_count" integer DEFAULT 0 NOT NULL,
	"queue_status" "queue_status" DEFAULT 'pending' NOT NULL,
	"job_id" uuid,
	"suggested_client_id" uuid,
	"suggested_client_name" text,
	"suggested_date" text,
	"suggested_category" "job_category",
	"date_ambiguous" text,
	CONSTRAINT "drive_folders_drive_folder_id_unique" UNIQUE("drive_folder_id")
);
--> statement-breakpoint
CREATE TABLE "drive_sync_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"folders_seen" integer DEFAULT 0 NOT NULL,
	"folders_new" integer DEFAULT 0 NOT NULL,
	"files_new" integer DEFAULT 0 NOT NULL,
	"errors" integer DEFAULT 0 NOT NULL,
	"error_detail" text
);
--> statement-breakpoint
CREATE TABLE "job_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"payload" jsonb,
	"run_after" timestamp with time zone DEFAULT now() NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"status" "queue_job_status" DEFAULT 'pending' NOT NULL,
	"last_error" text,
	"locked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"drive_file_id" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"kind" text DEFAULT 'photo' NOT NULL,
	"bytes" integer DEFAULT 0 NOT NULL,
	"width" integer,
	"height" integer,
	"taken_at" timestamp with time zone,
	"checksum" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visibility" "asset_visibility" DEFAULT 'private' NOT NULL,
	"derive_status" "derive_status" DEFAULT 'pending' NOT NULL,
	CONSTRAINT "media_assets_drive_file_id_unique" UNIQUE("drive_file_id")
);
--> statement-breakpoint
CREATE TABLE "media_derivatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"variant" text NOT NULL,
	"storage_key" text NOT NULL,
	"bytes" integer DEFAULT 0 NOT NULL,
	"width" integer,
	"height" integer
);
--> statement-breakpoint
ALTER TABLE "drive_folders" ADD CONSTRAINT "drive_folders_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drive_folders" ADD CONSTRAINT "drive_folders_suggested_client_id_clients_id_fk" FOREIGN KEY ("suggested_client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_derivatives" ADD CONSTRAINT "media_derivatives_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;