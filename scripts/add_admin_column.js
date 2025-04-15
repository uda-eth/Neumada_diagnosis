const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using the DATABASE_URL from the environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addAdminColumn() {
  const client = await pool.connect();
  try {
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_admin';
    `;
    const checkResult = await client.query(checkColumnQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('Column is_admin does not exist. Adding it...');
      
      // Add is_admin column
      const addColumnQuery = `
        ALTER TABLE users 
        ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
      `;
      await client.query(addColumnQuery);
      console.log('Column is_admin added successfully!');
      
      // Set admin status for a specified user (optional - uncomment if needed)
      /*
      const updateUserQuery = `
        UPDATE users 
        SET is_admin = TRUE 
        WHERE username = 'admin_username'; -- Replace with actual admin username
      `;
      await client.query(updateUserQuery);
      console.log('Admin user updated successfully!');
      */
    } else {
      console.log('Column is_admin already exists. No changes made.');
    }
  } catch (error) {
    console.error('Error adding admin column:', error);
  } finally {
    client.release();
  }
}

// Run the function and end the process when done
addAdminColumn()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 