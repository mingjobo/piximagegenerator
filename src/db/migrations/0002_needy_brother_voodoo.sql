-- 设置搜索路径到 pixelart schema
SET search_path TO pixelart;
--> statement-breakpoint
ALTER TABLE "pixelart"."categories" ADD COLUMN "sort" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "pixelart"."categories" ADD COLUMN "created_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pixelart"."categories" ADD COLUMN "updated_at" timestamp with time zone;