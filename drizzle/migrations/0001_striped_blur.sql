CREATE TABLE "tool_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"public_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" text NOT NULL,
	"image_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "public_id" SET DEFAULT 86013619;--> statement-breakpoint
ALTER TABLE "tool_images" ADD CONSTRAINT "tool_images_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "initial_picture";--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "final_picture";