declare module 'connect-pg-simple' {
  import session from 'express-session';
  import { Pool } from 'pg';

  interface PgSessionOptions {
    pool: Pool;
    tableName?: string;
    schemaName?: string;
    columnNames?: {
      sid?: string;
      session?: string;
      expire?: string;
    };
    pruneSessionInterval?: number | boolean;
    createTableIfMissing?: boolean;
    errorLog?: (...args: any[]) => void;
  }

  function connectPgSimple(session: typeof import('express-session')): new (options: PgSessionOptions) => session.Store;
  
  export = connectPgSimple;
}