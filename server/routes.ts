import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { handleChatMessage } from "./chat";
import { getRecommendedEvents } from "./recommendations";
import { db } from "@db";
import { events, eventParticipants, users } from "@db/schema";
import { eq, desc, ilike, and, or } from "drizzle-orm";

// Mock user data for development
const mockUsers = [
  // Bali
  {
    username: "sarah_digital",
    fullName: "Sarah Chen",
    bio: "Digital nomad | UX Designer",
    location: "Bali",
    interests: ["Design", "Travel", "Photography"],
    currentMoods: ["Exploring", "Networking"],
    age: 28,
    gender: "female",
    profileImages: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
    ],
  },
  {
    username: "emma_yoga",
    fullName: "Emma Wilson",
    bio: "Yoga instructor & wellness coach",
    location: "Bali",
    interests: ["Yoga", "Meditation", "Wellness"],
    currentMoods: ["Peaceful", "Teaching"],
    age: 26,
    gender: "female",
    profileImages: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop",
    ],
  },
  {
    username: "maya_creative",
    fullName: "Maya Patel",
    bio: "Creative Director | Digital Artist",
    location: "Bali",
    interests: ["Art", "Design", "Technology"],
    currentMoods: ["Creating", "Collaborating"],
    age: 29,
    gender: "female",
    profileImages: [
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop",
    ],
  },

  // Bangkok
  {
    username: "alex_remote",
    fullName: "Alex Rodriguez",
    bio: "Software Engineer | Coffee Enthusiast",
    location: "Bangkok",
    interests: ["Tech", "Coffee", "Digital Marketing"],
    currentMoods: ["Networking", "Learning"],
    age: 31,
    gender: "male",
    profileImages: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    ],
  },
  {
    username: "lisa_content",
    fullName: "Lisa Thompson",
    bio: "Content Creator | Travel Blogger",
    location: "Bangkok",
    interests: ["Travel", "Photography", "Writing"],
    currentMoods: ["Exploring", "Creating"],
    age: 27,
    gender: "female",
    profileImages: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
    ],
  },
  {
    username: "sophia_chef",
    fullName: "Sophia Lee",
    bio: "Chef | Food Photography",
    location: "Bangkok",
    interests: ["Cooking", "Photography", "Culture"],
    currentMoods: ["Foodie", "Teaching"],
    age: 30,
    gender: "female",
    profileImages: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop",
    ],
  },

  // Barcelona
  {
    username: "maria_architect",
    fullName: "Maria Garcia",
    bio: "Architect | Design Consultant",
    location: "Barcelona",
    interests: ["Architecture", "Design", "Art"],
    currentMoods: ["Creating", "Exploring"],
    age: 32,
    gender: "female",
    profileImages: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop",
    ],
  },
  {
    username: "carmen_artist",
    fullName: "Carmen Rodriguez",
    bio: "Visual Artist | Art Teacher",
    location: "Barcelona",
    interests: ["Art", "Teaching", "Culture"],
    currentMoods: ["Creative", "Social"],
    age: 28,
    gender: "female",
    profileImages: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop",
    ],
  },
  {
    username: "ana_dance",
    fullName: "Ana Martinez",
    bio: "Dance Instructor | Event Organizer",
    location: "Barcelona",
    interests: ["Dance", "Events", "Music"],
    currentMoods: ["Energetic", "Teaching"],
    age: 25,
    gender: "female",
    profileImages: [
      "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=400&h=600&fit=crop",
    ],
  },
  {
    username: "john_explorer",
    fullName: "John Doe",
    bio: "Adventurer | Nature Lover",
    location: "Kyoto",
    interests: ["Hiking", "Nature", "Photography"],
    currentMoods: ["Relaxed", "Adventurous"],
    age: 25,
    gender: "male",
    profileImages: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop",
    ],
  },
  {
    username: "jane_artist",
    fullName: "Jane Smith",
    bio: "Artist | Musician",
    location: "Paris",
    interests: ["Art", "Music", "Culture"],
    currentMoods: ["Creative", "Inspired"],
    age: 35,
    gender: "female",
    profileImages: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop",
    ],
  },
];

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Chat API
  app.post("/api/chat", handleChatMessage);

  // Browse Users API
  app.get("/api/users/browse", async (req, res) => {
    try {
      const { city, gender, minAge, maxAge, interests, moods } = req.query;

      // For development, return mock data
      let filteredUsers = [...mockUsers];

      if (city && city !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          user.location.toLowerCase() === (city as string).toLowerCase()
        );
      }

      if (gender && gender !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          user.gender === gender
        );
      }

      if (minAge) {
        filteredUsers = filteredUsers.filter(user => 
          user.age >= parseInt(minAge as string)
        );
      }

      if (maxAge) {
        filteredUsers = filteredUsers.filter(user => 
          user.age <= parseInt(maxAge as string)
        );
      }

      if (interests && Array.isArray(interests)) {
        filteredUsers = filteredUsers.filter(user => 
          interests.some(interest => 
            user.interests.includes(interest as string)
          )
        );
      }

      if (moods && Array.isArray(moods)) {
        filteredUsers = filteredUsers.filter(user => 
          moods.some(mood => 
            user.currentMoods.includes(mood as string)
          )
        );
      }

      res.json(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get recommended events for the current user
  app.get("/api/events/recommended", async (req, res) => {
    try {
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