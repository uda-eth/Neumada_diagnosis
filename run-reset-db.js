import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Warning prompt
console.log('\n⚠️  WARNING ⚠️');
console.log('This script will DELETE ALL DATA in ALL TABLES in your database.');
console.log('Your database structure (tables, columns, constraints) will be preserved.');
console.log('\nPress Ctrl+C now to cancel, or wait 5 seconds to continue...');

// Wait 5 seconds before proceeding
setTimeout(async () => {
  try {
    const { Pool } = pg;
    
    // Get database connection string from environment variable
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.error('Error: DATABASE_URL environment variable is not set');
      process.exit(1);
    }
    
    console.log('\nConnecting to database...');
    
    // Create a connection pool
    const pool = new Pool({
      connectionString,
    });
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'reset-database.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing database reset script...');
    
    // Execute the SQL commands
    const result = await pool.query(sqlCommands);
    
    console.log('\nDatabase reset completed successfully!');
    console.log('All data has been removed, but the database structure is preserved.');
    console.log('You can now add new data to your database.');
    
    // Close the connection pool
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Error during database reset:', error);
    process.exit(1);
  }
}, 5000);