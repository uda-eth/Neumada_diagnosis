import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { handleChatMessage } from "./chat";
import { getRecommendedEvents } from "./recommendations";
import { db } from "@db";
import { events, eventParticipants } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Chat API
  app.post("/api/chat", handleChatMessage);

  // Get recommended events for the current user
  app.get("/api/events/recommended", async (req, res) => {
    try {
      // For demo purposes, return recent events
      const results = await db.query.events.findMany({
        orderBy: [desc(events.date)],
        limit: 6
      });

      res.json(results);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommended events" });
    }
  });

  // Events API
  app.get("/api/events", async (req, res) => {
    try {
      const { category, location } = req.query;

      const results = await db.query.events.findMany({
        where: (events, { eq, and }) => {
          const conditions = [];
          if (category) {
            conditions.push(eq(events.category, category as string));
          }
          if (location) {
            conditions.push(eq(events.location, location as string));
          }
          return conditions.length > 0 ? and(...conditions) : undefined;
        },
        orderBy: [desc(events.date)]
      });

      res.json(results);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const [event] = await db
        .insert(events)
        .values({
          ...req.body,
          creatorId: req.user?.id || null,
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
      console.error("Error updating participation:", error);
      res.status(500).json({ error: "Failed to update participation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}