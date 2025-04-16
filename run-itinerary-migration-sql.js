import pg from 'pg';
const { Pool } = pg;

async function runItineraryMigration() {
  console.log('Starting itinerary field migration...');
  
  // Create a connection to the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if the column already exists
    const checkColumnResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'itinerary';
    `);
    
    if (checkColumnResult.rows.length === 0) {
      // Column doesn't exist, so add it
      console.log('Itinerary column does not exist, adding it now...');
      await pool.query(`
        ALTER TABLE events 
        ADD COLUMN itinerary JSONB DEFAULT '[]'::jsonb;
      `);
      console.log('Successfully added itinerary field to events table');
    } else {
      console.log('Itinerary field already exists in events table');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runItineraryMigration();