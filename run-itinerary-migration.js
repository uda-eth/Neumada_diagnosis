// Simple script to run the itinerary migration
import { addEventItineraryField } from './migrations/0003_add_event_itinerary.js';

async function runItineraryMigration() {
  try {
    console.log('Starting itinerary field migration...');
    const result = await addEventItineraryField();
    
    if (result.success) {
      console.log('Migration completed successfully!');
      console.log(result.message);
    } else {
      console.error('Migration failed:');
      console.error(result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error during migration:');
    console.error(error);
    process.exit(1);
  }
}

runItineraryMigration();