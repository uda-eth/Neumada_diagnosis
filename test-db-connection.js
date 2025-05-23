// Test script to verify direct TCP connection to PostgreSQL
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  // Create the pool with the proper configuration
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Simple query to test the connection
    const result = await pool.query('SELECT NOW()');
    
    console.log('✅ Database connection successful!');
    console.log('Current database time:', result.rows[0].now);
    
    // Verify database information
    const dbInfoResult = await pool.query(`
      SELECT current_database() as db_name, 
             current_user as db_user
    `);
    
    console.log('\nDatabase information:');
    console.log('Database name:', dbInfoResult.rows[0].db_name);
    console.log('Database user:', dbInfoResult.rows[0].db_user);
    
    // Test a simple table query (adjust table name if needed)
    try {
      const tablesResult = await pool.query(`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
        LIMIT 5
      `);
      
      console.log('\nSample tables in database:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.tablename}`);
      });
    } catch (tableErr) {
      console.log('Could not query tables:', tableErr.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);
    return false;
  } finally {
    // Close the connection pool
    await pool.end();
    console.log('\nConnection pool closed.');
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    console.log('\nTest completed.');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });