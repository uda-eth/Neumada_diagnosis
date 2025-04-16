CREATE TABLE "event_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"user_id" integer,
	"status" text NOT NULL,
	"ticket_quantity" integer DEFAULT 1,
	"purchase_date" timestamp,
	"ticket_code" text,
	"payment_status" text DEFAULT 'pending',
	"payment_intent_id" text,
	"check_in_status" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"stripe_checkout_session_id" text
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"city" text NOT NULL,
	"location" text NOT NULL,
	"date" timestamp NOT NULL,
	"end_date" timestamp,
	"image" text,
	"image_url" text,
	"category" text NOT NULL,
	"creator_id" integer,
	"capacity" integer,
	"price" varchar,
	"ticket_type" text NOT NULL,
	"available_tickets" integer,
	"created_at" timestamp DEFAULT now(),
	"is_private" boolean DEFAULT false,
	"is_business_event" boolean DEFAULT false,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"attending_count" integer DEFAULT 0,
	"interested_count" integer DEFAULT 0,
	"time_frame" text,
	"stripe_product_id" text,
	"stripe_price_id" text
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"inviter_id" integer,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"invitee_id" integer,
	CONSTRAINT "invitations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer,
	"receiver_id" integer,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"language" text DEFAULT 'en'
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_participant_id" integer,
	"stripe_charge_id" text,
	"stripe_checkout_session_id" text NOT NULL,
	"stripe_customer_id" text,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_stripe_charge_id_unique" UNIQUE("stripe_charge_id"),
	CONSTRAINT "payments_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer,
	"expires_at" timestamp NOT NULL,
	"data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"city" text NOT NULL,
	"is_current" boolean DEFAULT false,
	"is_primary" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"email" text,
	"reason" text,
	"arrival_date" timestamp,
	"departure_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_connections" (
	"follower_id" integer,
	"following_id" integer,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_connections_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text,
	"profile_type" text DEFAULT 'member',
	"gender" text,
	"sexual_orientation" text,
	"bio" text,
	"profile_image" text,
	"profile_images" jsonb DEFAULT '[]'::jsonb,
	"location" text,
	"birth_location" text,
	"next_location" text,
	"interests" jsonb,
	"current_moods" jsonb,
	"profession" text,
	"age" integer,
	"business_name" text,
	"business_description" text,
	"website_url" text,
	"created_at" timestamp DEFAULT now(),
	"last_active" timestamp,
	"is_premium" boolean DEFAULT false,
	"preferred_language" text DEFAULT 'en',
	"referral_code" text,
	"referred_by" integer,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitee_id_users_id_fk" FOREIGN KEY ("invitee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_event_participant_id_event_participants_id_fk" FOREIGN KEY ("event_participant_id") REFERENCES "public"."event_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cities" ADD CONSTRAINT "user_cities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;