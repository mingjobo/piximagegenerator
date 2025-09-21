-- 设置搜索路径到 pixelart schema
SET search_path TO pixelart;
--> statement-breakpoint
CREATE TABLE "pixelart"."categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pixelart.categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50),
	CONSTRAINT "categories_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
