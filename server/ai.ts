import { Router } from "express";
import { db } from "../db";
import { events } from "../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export const aiRouter = Router();

// Streamlined AI events endpoint focusing on direct DB filtering
aiRouter.get("/events", async (req, res, next) => {
  try {
    const { 
      id, 
      location, 
      city,
      category,
      dateFrom,
      dateTo,
      date // kept for backward compatibility
    } = req.query as Record<string, string>;
    
    console.log("AI events endpoint request params:", req.query);
    
    // Build conditions array for the query
    const conditions = [];
    
    if (id && !isNaN(Number(id))) {
      conditions.push(eq(events.id, Number(id)));
    }
    
    // Handle city parameter (checks both city and location fields)
    if (city) {
      conditions.push(eq(events.location, city));
    } else if (location) {
      conditions.push(eq(events.location, location));
    }
    
    if (category) {
      conditions.push(eq(events.category, category));
    }
    
    // Add date conditions directly to the query
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      conditions.push(gte(events.date, fromDate));
    } else if (date) {
      // Use legacy date param if dateFrom not provided
      const fromDate = new Date(date);
      conditions.push(gte(events.date, fromDate));
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      conditions.push(lte(events.date, toDate));
    }
    
    // Execute query with all conditions
    let result;
    if (conditions.length > 0) {
      result = await db.select().from(events).where(and(...conditions));
    } else {
      result = await db.select().from(events);
    }
    
    // Add human-readable date format
    const eventsWithMetadata = result.map(event => ({
      ...event,
      humanReadableDate: new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }));
    
    console.log(`AI events endpoint: Returning ${eventsWithMetadata.length} events`);
    res.json(eventsWithMetadata);
  } catch (err) {
    console.error("Error in AI events endpoint:", err);
    next(err);
  }
});

export default aiRouter;