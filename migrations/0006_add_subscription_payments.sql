-- Create subscription_payments table
CREATE TABLE IF NOT EXISTS "subscription_payments" (
    "id" SERIAL PRIMARY KEY,
    "subscription_id" INTEGER NOT NULL REFERENCES "subscriptions"("id") ON DELETE CASCADE,
    "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "stripe_invoice_id" TEXT UNIQUE,
    "stripe_payment_intent_id" TEXT UNIQUE,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "billing_reason" TEXT,
    "period_start" TIMESTAMP NOT NULL,
    "period_end" TIMESTAMP NOT NULL,
    "payment_method" TEXT,
    "receipt_url" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS "idx_subscription_payments_subscription_id" ON "subscription_payments"("subscription_id");
CREATE INDEX IF NOT EXISTS "idx_subscription_payments_user_id" ON "subscription_payments"("user_id");
CREATE INDEX IF NOT EXISTS "idx_subscription_payments_created_at" ON "subscription_payments"("created_at");