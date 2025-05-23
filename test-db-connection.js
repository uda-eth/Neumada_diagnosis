import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function testDatabaseConnection() {
  console.log("Testing direct TCP database connection...");
  
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Attempting to connect to database via TCP...");
    const result = await pool.query("SELECT NOW() as current_time, version() as db_version");
    console.log("✅ Database connection successful!");
    console.log("Database time:", result.rows[0].current_time);
    console.log("Database version:", result.rows[0].db_version);

    // Test creating a simple table
    console.log("Testing table creation...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Table creation successful!");

    // Insert a test record
    await pool.query(`
      INSERT INTO test_connection (message) VALUES ('TCP connection test successful')
    `);
    console.log("✅ Data insertion successful!");

    // Clean up test table
    await pool.query(`DROP TABLE test_connection`);
    console.log("✅ Cleanup successful!");

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Error details:", error);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection().catch(console.error);