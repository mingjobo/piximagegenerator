-- 设置搜索路径到 pixelart schema
SET search_path TO pixelart;
--> statement-breakpoint
ALTER TABLE "pixelart"."posts" ADD COLUMN "category_uuid" varchar(255);