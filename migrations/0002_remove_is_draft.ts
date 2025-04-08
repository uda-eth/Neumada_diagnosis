
import { sql } from "drizzle-orm";

export async function up(db: any) {
  await db.execute(sql`
    ALTER TABLE events 
    DROP COLUMN IF EXISTS is_draft;
  `);
}

export async function down(db: any) {
  await db.execute(sql`
    ALTER TABLE events 
    ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;
  `);
}
