require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Create a new pool using the DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdmin() {
  // Default admin credentials - change these or pass as arguments
  const username = process.argv[2] || 'admin';
  const email = process.argv[3] || 'admin@example.com';
  const password = process.argv[4] || 'admin123';
  
  if (password.length < 8) {
    console.error('Password must be at least 8 characters long');
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
    
    // Check if user already exists
    const checkUserQuery = `
      SELECT id 
      FROM users 
      WHERE username = $1 OR email = $2;
    `;
    const existingUser = await client.query(checkUserQuery, [username, email]);
    
    if (existingUser.rows.length > 0) {
      // User exists, update to admin
      const updateQuery = `
        UPDATE users 
        SET is_admin = TRUE 
        WHERE id = $1 
        RETURNING id, username, email;
      `;
      const updated = await client.query(updateQuery, [existingUser.rows[0].id]);
      console.log(`Existing user updated to admin: ${JSON.stringify(updated.rows[0])}`);
    } else {
      // Create new admin user
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const insertQuery = `
        INSERT INTO users (username, email, password, is_admin, full_name, profile_image, created_at) 
        VALUES ($1, $2, $3, TRUE, 'Admin User', NULL, NOW()) 
        RETURNING id, username, email;
      `;
      const result = await client.query(insertQuery, [username, email, hashedPassword]);
      console.log(`Admin user created: ${JSON.stringify(result.rows[0])}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

createAdmin()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 