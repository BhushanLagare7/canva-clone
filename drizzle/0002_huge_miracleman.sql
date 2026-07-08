UPDATE "project" SET "isTemplate" = false WHERE "isTemplate" IS NULL;--> statement-breakpoint
UPDATE "project" SET "isPro" = false WHERE "isPro" IS NULL;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "isTemplate" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "isTemplate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "isPro" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "isPro" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "userId_idx" ON "project" USING btree ("userId");