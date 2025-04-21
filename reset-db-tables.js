// Reset database by directly referring to table names
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  try {
    console.log('\n⚠️  STARTING DATABASE RESET ⚠️');
    console.log('This operation will delete all data but keep the database structure.');
    
    // Define tables in the correct deletion order (child tables first, parent tables last)
    // This order is based on foreign key dependencies from the schema
    const tables = [
      // First junction tables with multiple foreign keys
      'subscription_payments',
      'user_connections',
      'event_participants',
      
      // Then tables with single foreign keys
      'messages',
      'invitations',
      'user_cities',
      'sessions',
      'payments',
      'subscriptions',
      
      // Main entity tables last
      'events',
      'users'
    ];

    console.log(`Will attempt to reset ${tables.length} tables`);
    
    for (const tableName of tables) {
      try {
        console.log(`Deleting all data from table: ${tableName}`);
        
        // Use raw SQL for direct deletion
        await db.execute(sql.raw(`DELETE FROM "${tableName}"`));
        
        console.log(`✓ Successfully cleared table: ${tableName}`);
      } catch (err) {
        console.error(`Error clearing table ${tableName}:`, err.message);
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

// Warning prompt
console.log('\n⚠️  WARNING ⚠️');
console.log('This script will DELETE ALL DATA in your database.');
console.log('This cannot be undone. Make sure you have backups if needed.');
console.log('\nYou have 5 seconds to cancel with Ctrl+C...');

// Wait 5 seconds before proceeding
setTimeout(() => {
  resetDatabase().catch(err => {
    console.error('Failed to reset database:', err);
    process.exit(1);
  });
}, 5000);