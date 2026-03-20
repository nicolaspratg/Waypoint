CREATE TABLE "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"destination" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
