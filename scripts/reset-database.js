// This script truncates all tables in the database but keeps the structure intact
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  try {
    console.log('Starting database reset operation...');
    
    // Begin a transaction to ensure all operations succeed or fail together
    await db.transaction(async (tx) => {
      console.log('Disabling foreign key constraints temporarily...');
      // Temporarily disable foreign key constraints
      await tx.execute(sql`SET session_replication_role = 'replica';`);
      
      // Get list of all tables
      const tablesResult = await tx.execute(sql`
        SELECT tablename FROM pg_tables 
        WHERE schemaname='public' 
        AND tablename NOT LIKE 'pg_%' 
        AND tablename NOT LIKE 'drizzle_%';
      `);
      
      const tables = tablesResult.rows.map(row => row.tablename);
      console.log(`Found ${tables.length} tables to truncate:`, tables);
      
      // Truncate each table
      for (const table of tables) {
        console.log(`Truncating table: ${table}`);
        await tx.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE;`));
      }
      
      console.log('Re-enabling foreign key constraints...');
      // Re-enable foreign key constraints
      await tx.execute(sql`SET session_replication_role = 'origin';`);
    });
    
    console.log('Database reset complete! All data has been removed while preserving the structure.');
  } catch (error) {
    console.error('Error resetting database:', error);
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