require('dotenv').config();
const { Pool } = require('pg');

// Create a new pool using the DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function makeAdmin() {
  // Replace 'admin_username' with the username you want to make an admin
  const username = process.argv[2] || 'admin';
  
  if (!username) {
    console.error('Please provide a username as a command line argument');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    // First, check if the is_admin column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_admin';
    `;
    const columnResult = await client.query(checkColumnQuery);
    
    // If the column doesn't exist, create it
    if (columnResult.rows.length === 0) {
      console.log('Column is_admin does not exist. Adding it...');
      const addColumnQuery = `
        ALTER TABLE users 
        ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
      `;
      await client.query(addColumnQuery);
      console.log('Column is_admin added successfully');
    }
    
    // Find the user
    const findUserQuery = `
      SELECT id, username 
      FROM users 
      WHERE username = $1;
    `;
    const userResult = await client.query(findUserQuery, [username]);
    
    if (userResult.rows.length === 0) {
      console.error(`User '${username}' not found`);
      process.exit(1);
    }
    
    // Update the user to be an admin
    const updateQuery = `
      UPDATE users 
      SET is_admin = TRUE 
      WHERE id = $1;
    `;
    await client.query(updateQuery, [userResult.rows[0].id]);
    
    console.log(`User '${username}' is now an admin`);
  } catch (error) {
    console.error('Error making user admin:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

makeAdmin()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 