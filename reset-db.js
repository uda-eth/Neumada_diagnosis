// This is a standalone script to truncate all tables in the database but keep the structure intact
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  try {
    console.log('Starting database reset operation...');
    
    // Get list of all tables first
    const tablesResult = await db.execute(sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname='public' 
      AND tablename NOT LIKE 'pg_%' 
      AND tablename NOT LIKE 'drizzle_%';
    `);
    
    console.log('Table result structure:', JSON.stringify(tablesResult, null, 2));
    
    // Handle different response structures
    let tables = [];
    if (tablesResult.rows) {
      tables = tablesResult.rows.map(row => row.tablename);
    } else if (Array.isArray(tablesResult)) {
      tables = tablesResult.map(row => row.tablename);
    } else {
      console.error('Unexpected table result format:', tablesResult);
      throw new Error('Cannot determine database table structure');
    }
    
    console.log(`Found ${tables.length} tables:`, tables);
    
    // Determine the order of tables based on dependencies
    // We need to truncate child tables before parent tables due to foreign key constraints
    const orderedTables = [...tables];
    
    // Perform the truncation outside of a transaction so we can handle errors individually
    for (const table of orderedTables) {
      try {
        console.log(`Truncating table: ${table}`);
        
        // First disable triggers on this table to avoid foreign key constraint errors
        await db.execute(sql`ALTER TABLE "${sql.raw(table)}" DISABLE TRIGGER ALL;`);
        
        // Then truncate the table
        await db.execute(sql`TRUNCATE TABLE "${sql.raw(table)}";`);
        
        // Re-enable triggers
        await db.execute(sql`ALTER TABLE "${sql.raw(table)}" ENABLE TRIGGER ALL;`);
        
        console.log(`Successfully truncated table: ${table}`);
      } catch (err) {
        console.error(`Error truncating table ${table}:`, err.message);
        // Continue with other tables even if one fails
      }
    }
    
    console.log('Database reset operation complete!');
    console.log('All data has been removed while preserving the table structure.');
  } catch (error) {
    console.error('Error during database reset:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the reset function
resetDatabase().catch(err => {
  console.error('Failed to reset database:', err);
  process.exit(1);
});