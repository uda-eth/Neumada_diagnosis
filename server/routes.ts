import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { handleChatMessage } from "./chat";
import { db } from "@db";
import { events, eventParticipants } from "@db/schema";
import { eq, and, gte, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Chat API
  app.post("/api/chat", handleChatMessage);

  // Events API
  app.get("/api/events", async (req, res) => {
    try {
      const { category, location } = req.query;
      let query = db.select().from(events).orderBy(desc(events.date));

      if (category) {
        query = query.where(eq(events.category, category as string));
      }
      if (location) {
        query = query.where(eq(events.location, location as string));
      }

      const results = await query;
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [event] = await db
        .insert(events)
        .values({ ...req.body, creatorId: req.user.id })
        .returning();
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.post("/api/events/:eventId/participate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
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
      res.status(500).json({ error: "Failed to update participation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}