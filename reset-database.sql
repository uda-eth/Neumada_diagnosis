-- SQL Script to reset all data in the database while preserving structure
-- This will truncate all tables in the correct order to avoid foreign key constraint issues

-- Temporarily disable all triggers (foreign key constraints)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL;';
    END LOOP;
END $$;

-- Truncate all tables in the database
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE;';
    END LOOP;
END $$;

-- Re-enable all triggers
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE TRIGGER ALL;';
    END LOOP;
END $$;

-- Confirmation message
SELECT 'All tables have been truncated successfully. Database structure is preserved.' AS result;