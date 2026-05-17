CREATE TYPE "public"."area_unit" AS ENUM('sqft', 'acres', 'guntas');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('sale', 'rent', 'both');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('active', 'sold', 'rented');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('house', 'site', 'apartment', 'agriculture', 'commercial_space', 'commercial_plot');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('buyer', 'seller', 'agent', 'admin');--> statement-breakpoint
CREATE TABLE "districts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"lat" numeric(10, 7) NOT NULL,
	"lng" numeric(10, 7) NOT NULL,
	CONSTRAINT "districts_name_unique" UNIQUE("name")
);
--> statement-breakpoint
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
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(300),
	"title" varchar(255) NOT NULL,
	"type" "property_type" NOT NULL,
	"price_label" varchar(50) NOT NULL,
	"price_value" numeric(15, 2) NOT NULL,
	"size_label" varchar(50) NOT NULL,
	"size_value" numeric(12, 2),
	"area_unit" "area_unit" DEFAULT 'sqft',
	"lat" numeric(10, 7) NOT NULL,
	"lng" numeric(10, 7) NOT NULL,
	"district_id" uuid,
	"city" varchar(100),
	"taluk" varchar(100),
	"listing_type" "listing_type" DEFAULT 'sale',
	"status" "property_status" DEFAULT 'active',
	"thumbnail_url" varchar(500),
	"description" text,
	"features" jsonb DEFAULT '[]'::jsonb,
	"seller_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"url" varchar(500) NOT NULL,
	"alt" varchar(255),
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "saved_properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "saved_properties_user_id_property_id_unique" UNIQUE("user_id","property_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"name" varchar(201),
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"phone" varchar(20),
	"avatar_url" varchar(500),
	"role" "user_role" DEFAULT 'buyer',
	"is_verified" boolean DEFAULT false,
	"is_pro" boolean DEFAULT false,
	"provider" varchar(20) DEFAULT 'local',
	"google_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;