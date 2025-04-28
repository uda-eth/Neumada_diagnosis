import { Router } from "express";
import { db } from "../db";
import { events } from "../db/schema";
import { eq, and, gte } from "drizzle-orm";

export const aiRouter = Router();

// Enhanced events endpoint with more filtering options
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
    } = req.query;
    
    console.log("AI events endpoint request params:", req.query);
    
    // Build filter object for the query
    const filter: any = {};
    
    if (id && !isNaN(Number(id))) {
      filter.id = Number(id);
    }
    
    // Handle either location or city parameter (location takes precedence)
    if (location) {
      filter.location = location;
    } else if (city) {
      filter.location = city; // Map city to location for backward compatibility
    }
    
    if (category) {
      filter.category = category;
    }
    
    // Build query with all available filters
    let events;
    
    if (Object.keys(filter).length > 0) {
      // Query with filters
      events = await db.query.events.findMany({
        where: (events, { eq }) => {
          const conditions = [];
          
          if (filter.id) {
            conditions.push(eq(events.id, filter.id));
          }
          
          if (filter.location) {
            conditions.push(eq(events.location, filter.location as string));
          }
          
          if (filter.category) {
            conditions.push(eq(events.category, filter.category as string));
          }
          
          return and(...conditions);
        }
      });
    } else {
      // Query all events
      events = await db.query.events.findMany();
    }
    
    // Apply date filtering after the initial query
    
    // First check new parameters dateFrom/dateTo
    if (dateFrom || dateTo || date) {
      events = events.filter(event => {
        const eventDate = new Date(event.date);
        
        // Check dateFrom (start date) filter
        if (dateFrom) {
          const fromDate = new Date(dateFrom as string);
          if (eventDate < fromDate) return false;
        }
        
        // Check dateTo (end date) filter
        if (dateTo) {
          const toDate = new Date(dateTo as string);
          if (eventDate > toDate) return false;
        }
        
        // Use legacy 'date' parameter if no dateFrom is provided
        if (!dateFrom && date) {
          const fromDate = new Date(date as string);
          if (eventDate < fromDate) return false;
        }
        
        return true;
      });
    }
    
    // Add enhanced metadata
    const eventsWithMetadata = events.map(event => ({
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