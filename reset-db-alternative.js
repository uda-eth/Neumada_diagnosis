// Alternative approach to reset database using Drizzle ORM DELETE statements
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';
import * as schema from './db/schema.js';

async function resetDatabaseAlternative() {
  try {
    console.log('\n⚠️  WARNING ⚠️');
    console.log('This script will DELETE ALL DATA in ALL TABLES in your database.');
    console.log('Your database structure (tables, columns, constraints) will be preserved.');
    console.log('\nPress Ctrl+C now to cancel, or wait 5 seconds to continue...');
    
    // Wait 5 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\nStarting database reset operation...');
    console.log('Using DELETE FROM statements for each table...');
    
    // Get all table names from the schema object
    const tableNames = Object.keys(schema).filter(key => 
      typeof schema[key] === 'object' && schema[key].hasOwnProperty('_.name')
    );
    
    console.log(`Found ${tableNames.length} tables: ${tableNames.join(', ')}`);
    
    // Loop through each table and delete all records
    for (const tableName of tableNames) {
      try {
        console.log(`Deleting data from table: ${tableName}`);
        const table = schema[tableName];
        
        // Execute DELETE statement
        const result = await db.delete(table);
        console.log(`Deleted all records from ${tableName}`);
      } catch (err) {
        console.error(`Error deleting data from ${tableName}:`, err.message);
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
resetDatabaseAlternative().catch(err => {
  console.error('Failed to reset database:', err);
  process.exit(1);
});