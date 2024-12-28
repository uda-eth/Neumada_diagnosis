import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { events, eventParticipants } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Events endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const allEvents = await db.query.events.findMany({
        orderBy: desc(events.date),
        with: {
          creator: true,
          participants: true,
        },
      });
      res.json(allEvents);
    } catch (error) {
      res.status(500).send("Error fetching events");
    }
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Must be logged in to create events");
    }

    try {
      const [newEvent] = await db
        .insert(events)
        .values({
          ...req.body,
          creatorId: req.user.id,
        })
        .returning();
      res.json(newEvent);
    } catch (error) {
      res.status(500).send("Error creating event");
    }
  });

  app.post("/api/events/:eventId/participate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Must be logged in to participate");
    }

    try {
      const [participation] = await db
        .insert(eventParticipants)
        .values({
          eventId: parseInt(req.params.eventId),
          userId: req.user.id,
          status: req.body.status,
        })
        .returning();
      res.json(participation);
    } catch (error) {
      res.status(500).send("Error registering participation");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
