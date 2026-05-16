CREATE TYPE "public"."area_unit" AS ENUM('sqft', 'acres', 'guntas');--> statement-breakpoint
ALTER TYPE "public"."listing_type" ADD VALUE 'both';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'seller' BEFORE 'agent';--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"message" text NOT NULL,
	"phone" varchar(20),
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
-- Migrate old enum values to new canonical names before dropping old type
UPDATE "public"."properties" SET "type" = 'agriculture'       WHERE "type" = 'agriculture land';--> statement-breakpoint
UPDATE "public"."properties" SET "type" = 'commercial_space'  WHERE "type" = 'commercial space';--> statement-breakpoint
UPDATE "public"."properties" SET "type" = 'commercial_plot'   WHERE "type" = 'commercial plots';--> statement-breakpoint
DROP TYPE "public"."property_type";--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('house', 'site', 'apartment', 'agriculture', 'commercial_space', 'commercial_plot');--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "type" SET DATA TYPE "public"."property_type" USING "type"::"public"."property_type";--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "slug" varchar(300);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "area_unit" "area_unit" DEFAULT 'sqft';--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "taluk" varchar(100);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "thumbnail_url" varchar(500);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "seller_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" varchar(500);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_pro" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_slug_unique" UNIQUE("slug");
