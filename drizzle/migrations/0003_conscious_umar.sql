CREATE TYPE "public"."image_type" AS ENUM('initial', 'final');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "public_id" SET DEFAULT 51438790;--> statement-breakpoint
ALTER TABLE "tool_images" ALTER COLUMN "image_type" SET DEFAULT 'initial'::"public"."image_type";--> statement-breakpoint
ALTER TABLE "tool_images" ALTER COLUMN "image_type" SET DATA TYPE "public"."image_type" USING "image_type"::"public"."image_type";