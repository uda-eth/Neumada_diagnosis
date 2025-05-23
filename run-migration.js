import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Read the .env file manually and set variables
const envConfig = dotenv.parse(fs.readFileSync('.env'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Check your .env file.");
  process.exit(1);
}

console.log("Running SQL migration for adding stripe_checkout_session_id column...");

// Execute the SQL directly
import pg from 'pg';
const { Pool } = pg;

async function runSQLMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log("Connected to database, running migrations...");
    
    // First migration: Add ticket_identifier column
    console.log("Adding ticket_identifier column...");
    await pool.query(`
      ALTER TABLE "event_participants" ADD COLUMN IF NOT EXISTS "ticket_identifier" text UNIQUE;
    `);
    
    // Second migration: Add stripe_checkout_session_id column
    console.log("Adding stripe_checkout_session_id column...");
    await pool.query(`
      ALTER TABLE "event_participants" ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" text;
    `);

    // Third migration: Create subscriptions table
    console.log("Creating subscriptions table...");
    await pool.query(`
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
    `);
    
    console.log("Migrations completed successfully!");
    
    // Verify the columns and table were added
    const checkColumnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'event_participants' 
      AND column_name IN ('stripe_checkout_session_id', 'ticket_identifier')
      ORDER BY column_name
    `);
    const checkColumns = checkColumnsResult.rows;

    const checkTableResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'subscriptions'
    `);
    const checkTable = checkTableResult.rows;
    
    if (checkColumns.length > 0) {
      console.log("Columns verified! Details:");
      checkColumns.forEach(col => console.log(col));
    } else {
      console.log("Columns were not added successfully.");
    }

    if (checkTable.length > 0) {
      console.log("Subscriptions table created successfully!");
    } else {
      console.log("Failed to create subscriptions table.");
    }
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
  }
}

runSQLMigration().catch(console.error); 