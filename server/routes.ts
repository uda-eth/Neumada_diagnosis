import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { handleChatMessage } from "./chat";
import { getRecommendedEvents } from "./recommendations";
import { findMatches } from "./services/matchingService";
import { db } from "@db";
import { events, eventParticipants, users } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Chat API
  app.post("/api/chat", handleChatMessage);

  // Browse Users API with improved filtering
  app.get("/api/users/browse", async (req, res) => {
    try {
      const { 
        city, 
        gender, 
        minAge, 
        maxAge, 
        interests, 
        moods 
      } = req.query;

      let conditions = [];

      if (city && city !== 'all') {
        conditions.push(eq(users.location, city as string));
      }

      if (gender && gender !== 'all') {
        conditions.push(eq(users.gender, gender as string));
      }

      if (minAge && !isNaN(Number(minAge))) {
        conditions.push(gte(users.age, parseInt(minAge as string)));
      }

      if (maxAge && !isNaN(Number(maxAge))) {
        conditions.push(lte(users.age, parseInt(maxAge as string)));
      }

      const results = await db.select().from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Filter by interests and moods in memory since they're JSON fields
      let filteredResults = [...results];

      if (interests && Array.isArray(interests)) {
        filteredResults = filteredResults.filter(user =>
          user.interests?.some(interest =>
            (interests as string[]).includes(interest)
          )
        );
      }

      if (moods && Array.isArray(moods)) {
        filteredResults = filteredResults.filter(user =>
          user.currentMoods?.some(mood =>
            (moods as string[]).includes(mood)
          )
        );
      }

      res.json(filteredResults);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Find matches API
  app.get("/api/matches", async (req, res) => {
    try {
      const matches = await findMatches(req.user);
      res.json(matches);
    } catch (error) {
      console.error("Error finding matches:", error);
      res.status(500).json({ error: "Failed to find matches" });
    }
  });

  // Events API
  app.get("/api/events", async (req, res) => {
    try {
      const { category, location } = req.query;
      let conditions = [];

      if (category) {
        conditions.push(eq(events.category, category as string));
      }
      if (location) {
        conditions.push(eq(events.location, location as string));
      }

      const results = await db.select().from(events)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(events.date));

      res.json(results);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const [event] = await db
        .insert(events)
        .values({
          ...req.body,
          creatorId: req.user.id,
          date: new Date(req.body.date),
        })
        .returning();
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.post("/api/events/:eventId/participate", async (req, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { eventId } = req.params;
      const { status } = req.body;

      const [participation] = await db
        .insert(eventParticipants)
        .values({
          eventId: parseInt(eventId),
          userId: req.user.id,
          status,
        })
        .returning();

      res.json(participation);
    } catch (error) {
      console.error("Error updating participation:", error);
      res.status(500).json({ error: "Failed to update participation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}