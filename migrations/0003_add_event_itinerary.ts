import { sql } from "drizzle-orm";

export async function up(db: any) {
  try {
    await db.execute(sql`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb
    `);
    console.log("Successfully added itinerary column to events table");
  } catch (error) {
    console.error("Failed to add itinerary column:", error);
    throw error;
  }
}

export async function down(db: any) {
  try {
    await db.execute(sql`
      ALTER TABLE events 
      DROP COLUMN IF EXISTS itinerary
    `);
    console.log("Successfully removed itinerary column from events table");
  } catch (error) {
    console.error("Failed to remove itinerary column:", error);
    throw error;
  }
}