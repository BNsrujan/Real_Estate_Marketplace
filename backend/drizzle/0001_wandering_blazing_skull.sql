CREATE TYPE "public"."amenity_category" AS ENUM('infrastructure', 'convenience', 'safety', 'nature', 'nearby');--> statement-breakpoint
CREATE TYPE "public"."blog_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."geometry_type" AS ENUM('point', 'linestring', 'polygon');--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(100),
	"category" "amenity_category",
	"is_custom" boolean DEFAULT false NOT NULL,
	CONSTRAINT "amenities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_post_tags" (
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "blog_post_tags_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(300) NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" text,
	"body" text,
	"cover_image" varchar(500),
	"status" "blog_status" DEFAULT 'draft',
	"author_id" uuid,
	"category_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	CONSTRAINT "blog_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "property_agriculture_details" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"water_source" varchar(100),
	"soil_type" varchar(100),
	"survey_number" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "property_amenities" (
	"property_id" uuid NOT NULL,
	"amenity_id" uuid NOT NULL,
	CONSTRAINT "property_amenities_property_id_amenity_id_pk" PRIMARY KEY("property_id","amenity_id")
);
--> statement-breakpoint
CREATE TABLE "property_geometries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"type" geometry_type NOT NULL,
	"geojson" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_residential_details" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"bhk_label" varchar(20),
	"bedrooms" integer,
	"bathrooms" integer,
	"balconies" integer,
	"floors" integer,
	"floor_number" integer,
	"furnished_status" varchar(30)
);
--> statement-breakpoint
CREATE TABLE "property_road_info" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"road_width" varchar(50),
	"road_type" varchar(50),
	"road_facing" boolean
);
--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."property_type";--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('house', 'apartment', 'villa', 'site', 'plot', 'agriculture', 'commercial_space', 'commercial_plot');--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "type" SET DATA TYPE "public"."property_type" USING "type"::"public"."property_type";--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "property_ref" varchar(20);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "expected_price" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "address" varchar(500);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "facing" varchar(30);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "site_dimensions" varchar(50);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "land_use" varchar(100);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "document_status" varchar(255);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "condition" varchar(100);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "contact_number" varchar(20);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "road_access" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN "is_cover" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_blog_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."blog_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_agriculture_details" ADD CONSTRAINT "property_agriculture_details_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_geometries" ADD CONSTRAINT "property_geometries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_residential_details" ADD CONSTRAINT "property_residential_details_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_road_info" ADD CONSTRAINT "property_road_info_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_blog_posts_slug" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_blog_posts_status" ON "blog_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_blog_posts_author_id" ON "blog_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_blog_posts_category_id" ON "blog_posts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_blog_posts_published_at" ON "blog_posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_properties_slug" ON "properties" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_properties_status" ON "properties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_properties_listing_type" ON "properties" USING btree ("listing_type");--> statement-breakpoint
CREATE INDEX "idx_properties_type" ON "properties" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_properties_district_id" ON "properties" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "idx_properties_seller_id" ON "properties" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_properties_is_featured" ON "properties" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_properties_price_value" ON "properties" USING btree ("price_value");--> statement-breakpoint
CREATE INDEX "idx_properties_latlng" ON "properties" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "idx_property_images_property_order" ON "property_images" USING btree ("property_id","display_order");