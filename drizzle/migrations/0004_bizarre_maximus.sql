CREATE TABLE "event_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"public_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" text NOT NULL,
	"document_type" text DEFAULT 'assignment_letter' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "public_id" SET DEFAULT 86892173;--> statement-breakpoint
ALTER TABLE "event_documents" ADD CONSTRAINT "event_documents_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;