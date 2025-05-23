import { Pool } from 'pg';

// Create a PostgreSQL connection pool that can be used by connect-pg-simple
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pgPool;