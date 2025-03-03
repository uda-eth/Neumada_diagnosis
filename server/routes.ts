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
import { DIGITAL_NOMAD_CITIES } from "../client/src/lib/constants";
import { getEventImage } from "../client/src/lib/eventImages";
import multer from 'multer';
import path from 'path';
import express from "express";


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

// City-specific profile images to make the experience more realistic
const PROFILE_IMAGES_BY_CITY: Record<string, string[]> = {
  "Bali": [
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&h=600&fit=crop&q=80"
  ],
  "Bangkok": [
    "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop&q=80"
  ],
  "Barcelona": [
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop&q=80"
  ],
  "Berlin": [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=600&fit=crop&q=80"
  ],
  "Lisbon": [
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539386276791-0fd5b1756cdf?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600&h=600&fit=crop&q=80"
  ],
  "London": [
    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=600&fit=crop&q=80"
  ],
  "Mexico City": [
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1557555187-23d685287bc3?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=600&h=600&fit=crop&q=80"
  ],
  "New York": [
    "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=600&fit=crop&q=80"
  ]
};

const MOCK_USERS: Record<string, MockUser[]> = DIGITAL_NOMAD_CITIES.reduce((acc, city) => {
  // Get city-specific profile images or use default ones
  const cityImages = PROFILE_IMAGES_BY_CITY[city] || PROFILE_IMAGES_BY_CITY["London"];

  acc[city] = Array.from({ length: 10 }, (_, i) => ({
    id: Math.floor(Math.random() * 1000),
    username: `user${i}_${city.toLowerCase().replace(/\s+/g, '')}`,
    fullName: [
      "Sofia Rodriguez",
      "Alex Chen",
      "Maya Patel",
      "Lucas Silva",
      "Emma Thompson",
      "Kai Nakamura",
      "Isabella Santos",
      "Omar Hassan",
      "Nina Kowalski",
      "Marcus Wong"
    ][i],
    age: 25 + Math.floor(Math.random() * 15),
    gender: Math.random() > 0.5 ? 'male' : 'female',
    profession: [
      'Software Developer',
      'Digital Marketer',
      'Content Creator',
      'UX Designer',
      'Startup Founder',
      'Travel Blogger',
      'Freelance Writer',
      'UI Designer',
      'Data Scientist',
      'Product Manager'
    ][i],
    location: city,
    bio: `Digital nomad based in ${city}, passionate about technology and travel. ${[
      "Love exploring local coffee shops and coworking spaces.",
      "Always seeking new cultural experiences and connections.",
      "Combining work and adventure while traveling the world.",
      "Building the future of remote work one project at a time.",
      "Creating content and sharing stories from around the globe."
    ][Math.floor(Math.random() * 5)]}`,
    interests: [
      'Remote Work',
      'Technology',
      'Travel',
      'Photography',
      'Entrepreneurship',
      'Yoga',
      'Surfing',
      'Cooking',
      'Languages',
      'Hiking'
    ].sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3)),
    currentMoods: [
      'Working',
      'Exploring',
      'Networking',
      'Learning',
      'Creating',
      'Adventuring',
      'Collaborating',
      'Relaxing'
    ].sort(() => Math.random() - 0.5).slice(0, 2),
    profileImage: cityImages[i % cityImages.length],
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 90 days
    updatedAt: new Date().toISOString()
  }));
  return acc;
}, {} as Record<string, MockUser[]>);

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const newEvents = {
  "Mexico City": [
    {
      id: 1001,
      title: "Blanco Yoga Retreat: Mountain Serenity",
      description: "Experience tranquility at our exclusive mountain yoga retreat in Blanco. Join us for a transformative session combining traditional yoga practices with panoramic Hill Country views. Perfect for all skill levels, this retreat offers a unique blend of mindfulness and natural beauty.",
      date: tomorrow.toISOString(),
      location: "Mexico City",
      category: "Sports",
      image: "/attached_assets/images.jpg",
      capacity: 20,
      price: 595,
      createdAt: new Date().toISOString(),
      interestedCount: 28
    },
    {
      id: 1002,
      title: "Contemporary Mexican Art Exhibition",
      description: "Explore the vibrant world of contemporary Mexican artists at this exclusive gallery exhibition. Features works from emerging local talents.",
      date: tomorrow.toISOString(),
      location: "Mexico City",
      category: "Cultural",
      image: "/attached_assets/art-gallery-event-stockcake.jpg",
      capacity: 50,
      price: 10,
      createdAt: new Date().toISOString(),
      interestedCount: 25
    },
    {
      id: 1004,
      title: "Rooftop Farm-to-Table Dinner Experience",
      description: "Join us for an intimate farm-to-table dinner featuring seasonal ingredients and spectacular city views. Includes wine pairing and chef's introduction.",
      date: new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Mexico City",
      category: "Social",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop&q=80",
      capacity: 30,
      price: 120,
      createdAt: new Date().toISOString(),
      interestedCount: 42
    },
    {
      id: 1005,
      title: "Desierto de los Leones Hiking Adventure",
      description: "Explore the historic Desierto de los Leones National Park on this guided hiking tour. Perfect for nature enthusiasts and photography lovers.",
      date: new Date(tomorrow.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Mexico City",
      category: "Sports",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop&q=80",
      capacity: 15,
      price: 45,
      createdAt: new Date().toISOString(),
      interestedCount: 19
    },
    {
      id: 1006,
      title: "Nocturnal Rhythms: Adam Ten & Carlita",
      description: "Experience an unforgettable night of melodic house and techno with internationally acclaimed artists Adam Ten and Carlita. Set in an exclusive venue with state-of-the-art sound system and immersive lighting design.",
      date: new Date(tomorrow.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Mexico City",
      category: "Social",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop&q=80",
      capacity: 400,
      price: 75,
      createdAt: new Date().toISOString(),
      interestedCount: 289
    }
  ]
};

// Update the MOCK_EVENTS object to include the new events
export const MOCK_EVENTS = DIGITAL_NOMAD_CITIES.reduce((acc, city) => {
  acc[city] = city === "Mexico City"
    ? [...(acc[city] || []), ...newEvents[city]]
    : (acc[city] || []);
  return acc;
}, {} as Record<string, any[]>);

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'));
    }
  }
});

export function registerRoutes(app: Express): Server {
  // Serve static files from attached_assets directory
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

  // Set up authentication routes first
  setupAuth(app);

  // Chat API
  app.post("/api/chat", handleChatMessage);

  // Browse Users API with improved filtering
  app.get("/api/users/browse", async (req, res) => {
    try {
      const city = req.query.city as string;

      // Get users for specific city or all cities if none specified
      let filteredUsers = city && city !== 'all'
        ? MOCK_USERS[city] || []
        : Object.values(MOCK_USERS).flat();

      res.json(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = Object.values(MOCK_USERS)
        .flat()
        .find(u => u.username === username);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
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
      const { location } = req.query;

      // Get events for specific location or all locations
      let filteredEvents = location && location !== 'all'
        ? MOCK_EVENTS[location as string] || []
        : Object.values(MOCK_EVENTS).flat();

      // Sort events by date
      filteredEvents.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
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

  // Update the event creation endpoint to handle file uploads
  app.post("/api/events", upload.single('image'), async (req, res) => {
    try {
      const eventData = {
        ...req.body,
        image: req.file ? `/uploads/${req.file.filename}` : getEventImage(req.body.category),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add validation here as needed

      res.json(eventData);
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