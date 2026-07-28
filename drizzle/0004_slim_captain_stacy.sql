CREATE TYPE "public"."expense_category" AS ENUM('travel', 'gear', 'software', 'studio', 'other');--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"amount_cents" integer NOT NULL,
	"description" text NOT NULL,
	"category" "expense_category" DEFAULT 'other' NOT NULL,
	"spent_on" date NOT NULL,
	"ticket_storage_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;