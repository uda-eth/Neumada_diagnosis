-- Create subscriptions table for premium memberships
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "stripe_subscription_id" TEXT UNIQUE,
  "stripe_customer_id" TEXT,
  "status" TEXT NOT NULL,
  "current_period_start" TIMESTAMP NOT NULL,
  "current_period_end" TIMESTAMP NOT NULL,
  "cancel_at_period_end" BOOLEAN DEFAULT false,
  "canceled_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "subscription_type" TEXT DEFAULT 'monthly',
  "price_id" TEXT
); 