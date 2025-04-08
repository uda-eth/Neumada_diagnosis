import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

async function main() {
  // Create postgres connection
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  console.log("Creating tables...");

  // Create tables
  try {
    // Create users table first
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT,
        profile_type TEXT DEFAULT 'member',
        gender TEXT,
        sexual_orientation TEXT,
        bio TEXT,
        profile_image TEXT,
        profile_images JSONB DEFAULT '[]',
        location TEXT,
        birth_location TEXT,
        next_location TEXT,
        interests JSONB,
        current_moods JSONB,
        profession TEXT,
        age INTEGER,
        business_name TEXT,
        business_description TEXT,
        website_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        last_active TIMESTAMP,
        is_premium BOOLEAN DEFAULT false,
        preferred_language TEXT DEFAULT 'en',
        referral_code TEXT UNIQUE,
        referred_by INTEGER
      )
    `);
    
    // Now we can create other tables that reference users
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        city TEXT NOT NULL,
        location TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        image TEXT,
        image_url TEXT,
        category TEXT NOT NULL,
        creator_id INTEGER REFERENCES users(id),
        capacity INTEGER,
        price VARCHAR,
        ticket_type TEXT NOT NULL,
        available_tickets INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        is_private BOOLEAN DEFAULT false,
        is_business_event BOOLEAN DEFAULT false,
        tags JSONB DEFAULT '[]',
        attending_count INTEGER DEFAULT 0,
        interested_count INTEGER DEFAULT 0,
        time_frame TEXT,
        stripe_product_id TEXT,
        stripe_price_id TEXT
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_participants (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id),
        user_id INTEGER REFERENCES users(id),
        status TEXT NOT NULL,
        ticket_quantity INTEGER DEFAULT 1,
        purchase_date TIMESTAMP,
        ticket_code TEXT,
        payment_status TEXT DEFAULT 'pending',
        payment_intent_id TEXT,
        check_in_status BOOLEAN DEFAULT false
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        language TEXT DEFAULT 'en'
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_connections (
        follower_id INTEGER REFERENCES users(id),
        following_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (follower_id, following_id)
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS invitations (
        id SERIAL PRIMARY KEY,
        inviter_id INTEGER REFERENCES users(id),
        email TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        invitee_id INTEGER REFERENCES users(id)
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_cities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        city TEXT NOT NULL,
        is_current BOOLEAN DEFAULT false,
        is_primary BOOLEAN DEFAULT false,
        arrival_date TIMESTAMP,
        departure_date TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        expires_at TIMESTAMP NOT NULL,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // After all tables are created, add self-reference for users
    await db.execute(sql`
      ALTER TABLE users 
      ADD CONSTRAINT fk_users_referred_by
      FOREIGN KEY (referred_by) 
      REFERENCES users(id)
    `);

    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await client.end();
  }
}

main().catch(console.error);