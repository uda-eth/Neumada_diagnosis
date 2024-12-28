import { db } from "@db";
import { events, users } from "@db/schema";
import { eq, ilike, desc, and, or, sql } from "drizzle-orm";
import type { User, Event } from "@db/schema";

export async function getRecommendedEvents(user: User, limit = 6): Promise<Event[]> {
  if (!user.interests || user.interests.length === 0) {
    // If user has no interests, return recent events
    return db.select()
      .from(events)
      .orderBy(desc(events.date))
      .limit(limit);
  }

  // Build array of conditions for matching interests
  const interestConditions = user.interests.map(interest => 
    or(
      ilike(events.category, `%${interest}%`),
      ilike(events.title, `%${interest}%`),
      ilike(events.description, `%${interest}%`)
    )
  );

  // Get events that match user interests, ordered by date
  const recommendedEvents = await db.select()
    .from(events)
    .where(
      and(
        or(...interestConditions),
        sql`${events.date} >= NOW()`  // Only future events
      )
    )
    .orderBy(desc(events.date))
    .limit(limit);

  return recommendedEvents;
}
