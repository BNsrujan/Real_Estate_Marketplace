ALTER TABLE "users" RENAME COLUMN "full_name" TO "name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_name";
