import postgres from "postgres";

// Load environment variables if needed
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Please make sure the database is properly configured.");
  process.exit(1);
}

async function runItineraryMigration() {
  const client = postgres(process.env.DATABASE_URL);
  
  try {
    console.log("Connected to database, adding itinerary column to events table...");
    
    // Add itinerary column
    await client`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb
    `;
    
    console.log("Migration completed successfully!");
    
    // Verify the column was added
    const checkColumn = await client`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name = 'itinerary'
    `;
    
    if (checkColumn.length > 0) {
      console.log("Itinerary column verified! Details:");
      checkColumn.forEach(col => console.log(col));
    } else {
      console.log("Itinerary column was not added successfully.");
    }
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await client.end();
  }
}

runItineraryMigration().catch(console.error);