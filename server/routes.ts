import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { handleChatMessage } from "./chat";
import { getRecommendedEvents } from "./recommendations";
import { findMatches } from "./services/matchingService";
import { translateMessage } from "./services/translationService";
import { db } from "@db";
import { events, eventParticipants, users } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { MOCK_EVENTS, DIGITAL_NOMAD_CITIES } from "../client/src/lib/constants";

interface MockUser {
  id: number;
  username: string;
  fullName: string;
  age: number;
  gender: string;
  profession: string;
  location: string;
  bio: string;
  interests: string[];
  currentMoods: string[];
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

const PROFILE_IMAGES = [
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&q=80"
];

const MOCK_USERS: Record<string, MockUser[]> = DIGITAL_NOMAD_CITIES.reduce((acc, city) => {
  acc[city] = Array.from({ length: 10 }, (_, i) => ({
    id: Math.floor(Math.random() * 1000),
    username: `user${i}_${city.toLowerCase().replace(/\s+/g, '')}`,
    fullName: `Digital Nomad ${i + 1}`,
    age: 25 + Math.floor(Math.random() * 15),
    gender: Math.random() > 0.5 ? 'male' : 'female',
    profession: [
      'Software Developer',
      'Digital Marketer',
      'Content Creator',
      'UX Designer',
      'Startup Founder'
    ][Math.floor(Math.random() * 5)],
    location: city,
    bio: `Digital nomad based in ${city}, passionate about technology and travel.`,
    interests: [
      'Remote Work',
      'Technology',
      'Travel',
      'Photography',
      'Entrepreneurship'
    ].sort(() => Math.random() - 0.5).slice(0, 3),
    currentMoods: [
      'Working',
      'Exploring',
      'Networking',
      'Learning'
    ].sort(() => Math.random() - 0.5).slice(0, 2),
    profileImage: PROFILE_IMAGES[i % PROFILE_IMAGES.length],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  return acc;
}, {} as Record<string, MockUser[]>);

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

      let filteredUsers = city && city !== 'all'
        ? MOCK_USERS[city as string] || []
        : Object.values(MOCK_USERS).flat();

      if (gender && gender !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.gender === gender);
      }

      if (minAge && !isNaN(Number(minAge))) {
        filteredUsers = filteredUsers.filter(user => user.age >= Number(minAge));
      }

      if (maxAge && !isNaN(Number(maxAge))) {
        filteredUsers = filteredUsers.filter(user => user.age <= Number(maxAge));
      }

      if (interests && Array.isArray(interests)) {
        filteredUsers = filteredUsers.filter(user =>
          user.interests?.some((interest: string) =>
            (interests as string[]).includes(interest)
          )
        );
      }

      if (moods && Array.isArray(moods)) {
        filteredUsers = filteredUsers.filter(user =>
          user.currentMoods?.some((mood: string) =>
            (moods as string[]).includes(mood)
          )
        );
      }

      res.json(filteredUsers);
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

      let filteredEvents = location && location !== 'all'
        ? MOCK_EVENTS[location as string] || []
        : Object.values(MOCK_EVENTS).flat();

      if (category && category !== 'all') {
        filteredEvents = filteredEvents.filter(event =>
          event.category.toLowerCase() === category.toString().toLowerCase()
        );
      }

      filteredEvents.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      res.json(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const allEvents = Object.values(MOCK_EVENTS).flat();
      const event = allEvents.find(e => e.id === parseInt(id));

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const mockEvent = {
        id: Math.floor(Math.random() * 1000),
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json(mockEvent);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.post("/api/events/:eventId/participate", async (req, res) => {
    try {
      const { eventId } = req.params;
      const { status } = req.body;

      const mockParticipation = {
        id: Math.floor(Math.random() * 1000),
        eventId: parseInt(eventId),
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json(mockParticipation);
    } catch (error) {
      console.error("Error updating participation:", error);
      res.status(500).json({ error: "Failed to update participation" });
    }
  });

  // Add translation endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;

      if (!text || !targetLanguage) {
        return res.status(400).json({ 
          error: "Missing required fields: text and targetLanguage" 
        });
      }

      const translation = await translateMessage(text, targetLanguage);
      res.json({ translation });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ 
        error: "Failed to translate message" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}