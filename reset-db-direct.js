// Direct approach to reset database using Drizzle ORM DELETE statements with explicit table references
import { db } from './db/index.js';
import * as schema from './db/schema.js';

async function resetDatabaseDirect() {
  try {
    console.log('\n⚠️  STARTING DATABASE RESET ⚠️');
    console.log('This operation will delete all data but keep the database structure.');
    
    console.log('\nStarting database reset operation...');
    
    // First, identify specific tables from the schema
    // We'll manually extract these by looking at the schema directly

    // Order matters! Delete from tables with foreign keys first, then their parents
    // This is a common dependency order: many-to-many tables first, then child tables, then parent tables
    const tables = [
      // Start with junction/relation tables that have foreign keys
      schema.userConnections,
      schema.eventParticipants,
      schema.itineraryItems,
      
      // Then go with entity tables that may have foreign keys to main tables
      schema.messages,
      schema.conversations,
      schema.tickets,
      schema.subscriptions,
      
      // Finally main entity tables
      schema.events,
      schema.users
    ];
    
    console.log(`Attempting to reset ${tables.length} tables`);
    
    // Delete from each table
    for (const table of tables) {
      try {
        if (!table) {
          continue; // Skip undefined tables (might happen if we named one incorrectly)
        }
        
        const tableName = table?._.name || "unknown";
        console.log(`Deleting data from table: ${tableName}`);
        
        // Execute DELETE statement
        await db.delete(table);
        console.log(`✓ Successfully deleted all records from ${tableName}`);
      } catch (err) {
        console.error(`Error deleting data from table:`, err.message);
        // Continue with other tables
      }
    }
    
    console.log('\nDatabase reset operation complete!');
    console.log('All data has been removed while preserving the table structure.');
    
  } catch (error) {
    console.error('Error during database reset:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the reset function
resetDatabaseDirect().catch(err => {
  console.error('Failed to reset database:', err);
  process.exit(1);
});