import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function checkColumns() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log("Checking for required columns in event_participants table...");
    
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'event_participants' 
      AND column_name IN ('stripe_checkout_session_id', 'ticket_identifier')
      ORDER BY column_name
    `);
    
    if (result.rows.length > 0) {
      console.log("Found columns:");
      result.rows.forEach(col => console.log(`- ${col.column_name} (${col.data_type})`));
      
      if (result.rows.length === 2) {
        console.log("✅ All required columns exist!");
      } else {
        console.log("❌ Some columns are missing!");
      }
    } else {
      console.log("❌ None of the required columns exist in the table.");
    }
  } catch (error) {
    console.error("Error checking columns:", error);
  } finally {
    await pool.end();
  }
}

checkColumns().catch((e) => {
  console.error(e);
  process.exit(1);
}); 