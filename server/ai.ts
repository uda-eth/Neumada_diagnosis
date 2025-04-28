import { Router } from "express";
import { db } from "../db";
import { events } from "../db/schema";
import { eq, and, gte } from "drizzle-orm";

export const aiRouter = Router();

// Return all events (or filter by ?id=, ?date=, ?location=)
aiRouter.get("/events", async (req, res, next) => {
  try {
    const { id, date, location } = req.query;
    
    // Build filter object for Drizzle query
    const filter: any = {};
    
    if (id && !isNaN(Number(id))) {
      filter.id = Number(id);
    }
    
    if (location) {
      filter.city = location;
    }
    
    // For date filtering, we need to do it after the initial query
    // since it needs a comparison operator
    let events;
    
    if (Object.keys(filter).length > 0) {
      // Query with filters
      events = await db.query.events.findMany({
        where: (events, { eq }) => {
          const conditions = [];
          
          if (filter.id) {
            conditions.push(eq(events.id, filter.id));
          }
          
          if (filter.city) {
            conditions.push(eq(events.city, filter.city as string));
          }
          
          return and(...conditions);
        }
      });
    } else {
      // Query all events
      events = await db.query.events.findMany();
    }
    
    // Apply date filtering if needed
    if (date) {
      const dateObj = new Date(date as string);
      events = events.filter(event => new Date(event.date) >= dateObj);
    }
    
    console.log(`AI events endpoint: Returning ${events.length} events`);
    res.json(events);
  } catch (err) {
    console.error("Error in AI events endpoint:", err);
    next(err);
  }
});

export default aiRouter;