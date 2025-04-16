import { sql } from "drizzle-orm";
import { db } from "../db";

export async function addEventItineraryField() {
  try {
    console.log("Starting migration: Adding itinerary field to events table");
    
    // Check if the column already exists
    const checkColumnQuery = sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'itinerary';
    `;
    
    const checkResult = await db.execute(checkColumnQuery);
    
    if (checkResult.length === 0) {
      // Column doesn't exist, so add it
      await db.execute(sql`
        ALTER TABLE events 
        ADD COLUMN itinerary JSONB DEFAULT '[]'::jsonb;
      `);
      
      console.log("Successfully added itinerary field to events table");
    } else {
      console.log("Itinerary field already exists in events table");
    }
    
    return { success: true, message: "Migration completed successfully" };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  }
}

export default addEventItineraryField;