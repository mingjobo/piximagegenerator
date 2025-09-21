-- 设置搜索路径到 pixelart schema
SET search_path TO pixelart;
--> statement-breakpoint
CREATE TABLE "pixelart"."works" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pixelart.works_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" varchar(255) NOT NULL,
	"user_uuid" varchar(255) NOT NULL,
	"emoji" varchar(50) NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "works_uuid_unique" UNIQUE("uuid")
);
