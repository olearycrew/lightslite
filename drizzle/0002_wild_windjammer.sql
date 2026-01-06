CREATE TABLE "layer_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"type" varchar(50) NOT NULL DEFAULT 'all',
	"layer_data" jsonb NOT NULL,
	"is_global" varchar(1) DEFAULT 'n',
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_layer_templates_user_id" ON "layer_templates"("user_id");
--> statement-breakpoint
CREATE INDEX "idx_layer_templates_type" ON "layer_templates"("type");
