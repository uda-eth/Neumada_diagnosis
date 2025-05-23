// Import the pool from our central db/index.ts file
import { pool } from '../../db/index';

// Export the pool to be used by connect-pg-simple
export default pool;