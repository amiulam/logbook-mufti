CREATE TYPE "public"."event_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" integer DEFAULT 35539664 NOT NULL,
	"name" text NOT NULL,
	"assignment_letter" text NOT NULL,
	"status" "event_status" DEFAULT 'not_started' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"total" integer NOT NULL,
	"initial_condition" text NOT NULL,
	"final_condition" text,
	"initial_picture" text,
	"final_picture" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;