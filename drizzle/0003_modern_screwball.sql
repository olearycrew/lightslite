CREATE TABLE "layer_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"type" varchar(50) DEFAULT 'all' NOT NULL,
	"layer_data" jsonb NOT NULL,
	"is_global" varchar(1) DEFAULT 'n',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "layer_templates" ADD CONSTRAINT "layer_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;