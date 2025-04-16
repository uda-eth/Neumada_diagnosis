import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

async function checkColumns() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client = postgres(process.env.DATABASE_URL);
  
  try {
    console.log("Checking for required columns in event_participants table...");
    
    const result = await client`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'event_participants' 
      AND column_name IN ('stripe_checkout_session_id', 'ticket_identifier')
      ORDER BY column_name
    `;
    
    if (result.length > 0) {
      console.log("Found columns:");
      result.forEach(col => console.log(`- ${col.column_name} (${col.data_type})`));
      
      if (result.length === 2) {
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
    await client.end();
  }
}

checkColumns().catch((e) => {
  console.error(e);
  process.exit(1);
}); 