import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function addMissingColumns() {
  console.log("Adding missing database columns...");
  
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Add itinerary column to events table
    console.log("Adding itinerary column to events table...");
    await pool.query(`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
    `);
    console.log("✅ itinerary column added successfully!");

    // Add is_admin column to users table
    console.log("Adding is_admin column to users table...");
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
    `);
    console.log("✅ is_admin column added successfully!");

    // Verify the columns were added
    console.log("Verifying columns...");
    const eventsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'itinerary'
    `);

    const usersColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_admin'
    `);

    if (eventsColumns.rows.length > 0) {
      console.log("✅ itinerary column verified in events table");
    }

    if (usersColumns.rows.length > 0) {
      console.log("✅ is_admin column verified in users table");
    }

    console.log("🎉 All missing columns have been added successfully!");

  } catch (error) {
    console.error("❌ Error adding columns:", error.message);
  } finally {
    await pool.end();
  }
}

addMissingColumns().catch(console.error);