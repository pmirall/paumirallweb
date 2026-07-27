CREATE TYPE "public"."deliverable_kind" AS ENUM('photos', 'video', 'reel', 'raw');--> statement-breakpoint
CREATE TYPE "public"."job_category" AS ENUM('artist', 'sport', 'video');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'confirmed', 'shot', 'editing', 'delivered', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'read', 'replied', 'converted', 'discarded');--> statement-breakpoint
CREATE TYPE "public"."time_entry_kind" AS ENUM('shoot', 'edit', 'travel', 'admin');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"tax_id" text,
	"billing_address" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"kind" "deliverable_kind" NOT NULL,
	"description" text NOT NULL,
	"quantity" integer,
	"delivered" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"public_title" text NOT NULL,
	"summary" text,
	"body" text,
	"year" integer NOT NULL,
	"cover_media_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"og_image_key" text,
	"published_at" timestamp with time zone,
	CONSTRAINT "job_publications_job_id_unique" UNIQUE("job_id"),
	CONSTRAINT "job_publications_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"client_id" uuid NOT NULL,
	"title" text NOT NULL,
	"category" "job_category" NOT NULL,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"shoot_date" date,
	"due_date" date,
	"delivered_at" timestamp with time zone,
	"internal_notes" text,
	"drive_folder_id" text,
	"budget_cents" integer,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "slug_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"replaced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "slug_history_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"date" date NOT NULL,
	"minutes" integer NOT NULL,
	"kind" time_entry_kind NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"service" text,
	"source" text DEFAULT 'web' NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"client_id" uuid,
	"job_id" uuid,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"diff" jsonb,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_publications" ADD CONSTRAINT "job_publications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slug_history" ADD CONSTRAINT "slug_history_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;