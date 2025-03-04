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
import path from "path";
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

// Create a simplified MOCK_USERS with just a few profiles that will clearly show at the top
const MOCK_USERS: Record<string, MockUser[]> = {};

// Initialize empty arrays for each city
DIGITAL_NOMAD_CITIES.forEach(city => {
  MOCK_USERS[city] = [];
});

// Add a few new profiles to Mexico City
MOCK_USERS["Mexico City"] = [
  {
    id: 1008,
    username: "sofia_traveler",
    fullName: "Sofia Martinez",
    age: 24,
    gender: "female",
    profession: "Travel Blogger",
    location: "Mexico City",
    bio: "Capturing the beauty of Mexico City through my lens. Love exploring hidden gems and sharing authentic travel stories.",
    interests: ["Travel", "Photography", "Writing", "Culture", "Food"],
    currentMoods: ["Exploring", "Creating", "Networking"],
    profileImage: "/attached_assets/profile-image-1.jpg", 
    createdAt: new Date().toISOString(), // Just created (newest)
    updatedAt: new Date().toISOString()
  },
  {
    id: 1007,
    username: "elena_model",
    fullName: "Elena Rodriguez",
    age: 26,
    gender: "female",
    profession: "Fashion Model",
    location: "Mexico City",
    bio: "Model based in Mexico City. Recently moved from Madrid for new creative opportunities. Looking to collaborate with photographers and designers.",
    interests: ["Fashion", "Photography", "Design", "Art", "Fitness"],
    currentMoods: ["Creating", "Networking", "Exploring"],
    profileImage: "/attached_assets/profile-image-2.jpg", 
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // Created 20 minutes ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 1006,
    username: "david_director",
    fullName: "David Miller",
    age: 35,
    gender: "male",
    profession: "Film Director",
    location: "Mexico City",
    bio: "Film director seeking inspiration in the vibrant culture of Mexico City. Looking to connect with creative professionals for upcoming projects.",
    interests: ["Film", "Art", "Culture", "Music", "Photography"],
    currentMoods: ["Creating", "Networking", "Exploring"],
    profileImage: "/attached_assets/profile-image-3.jpg", 
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // Created 40 minutes ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 1005,
    username: "lucas_artist",
    fullName: "Lucas Hernandez",
    age: 23,
    gender: "male",
    profession: "Digital Artist",
    location: "Mexico City",
    bio: "Digital artist with a passion for blending traditional Mexican art with modern design. Looking to collaborate and find inspiration in this amazing city.",
    interests: ["Art", "Design", "Technology", "Culture", "Music"],
    currentMoods: ["Creating", "Learning", "Networking"],
    profileImage: "/attached_assets/profile-image-4.jpg", 
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Created an hour ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 1004,
    username: "jasmine_creative",
    fullName: "Jasmine Carter",
    age: 25,
    gender: "female",
    profession: "Fashion Designer",
    location: "Mexico City",
    bio: "Creative soul with a passion for sustainable fashion. Recently moved to Mexico City to find inspiration for my new collection. Looking to connect with artists and designers.",
    interests: ["Fashion", "Design", "Sustainability", "Art", "Culture"],
    currentMoods: ["Creating", "Exploring", "Networking"],
    profileImage: "/attached_assets/profile-1734541908-340b1aee98a06ca5acf7600d53e051ba.jpg", 
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Created 2 hours ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 1000,
    username: "marco_nomad",
    fullName: "Marco Rivera",
    age: 27,
    gender: "male",
    profession: "Fashion Photographer",
    location: "Mexico City",
    bio: "Creative photographer exploring Mexico City's vibrant culture. Looking to collaborate with artists and meet fellow nomads. Love street photography and local cuisine.",
    interests: ["Photography", "Fashion", "Art", "Food", "Nightlife"],
    currentMoods: ["Creating", "Networking", "Exploring"],
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=600&fit=crop&q=80",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Created an hour ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 1001,
    username: "emma_nomad",
    fullName: "Emma Thompson",
    age: 28,
    gender: "female",
    profession: "UX Designer",
    location: "Mexico City",
    bio: "Just arrived in Mexico City! Looking to connect with other digital nomads and explore the local art scene.",
    interests: ["Design", "Art", "Coffee", "Museums"],
    currentMoods: ["Exploring", "Networking"],
    profileImage: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=600&h=600&fit=crop&q=80",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Created an hour ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 1002,
    username: "alex_remote",
    fullName: "Alex Chen",
    age: 31,
    gender: "male",
    profession: "Software Developer",
    location: "Mexico City",
    bio: "Software developer working remotely while exploring Mexico City. Looking for good coffee shops and coworking spaces.",
    interests: ["Coding", "Coffee", "Technology", "Remote Work"],
    currentMoods: ["Working", "Networking"],
    profileImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=600&h=600&fit=crop&q=80",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Created yesterday
    updatedAt: new Date().toISOString()
  },
  {
    id: 1003,
    username: "maria_travel",
    fullName: "Maria Santos",
    age: 26,
    gender: "female",
    profession: "Travel Blogger",
    location: "Mexico City",
    bio: "Documenting my journey through Latin America. Currently exploring Mexico City's vibrant neighborhoods and cuisine.",
    interests: ["Travel", "Photography", "Food", "Writing"],
    currentMoods: ["Creating", "Exploring"],
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&q=80",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Created 2 days ago
    updatedAt: new Date().toISOString()
  }
];

// Add a couple of profiles to other cities
MOCK_USERS["Bali"] = [
  {
    id: 2001,
    username: "surf_nomad",
    fullName: "Jake Wilson",
    age: 29,
    gender: "male",
    profession: "Startup Founder",
    location: "Bali",
    bio: "Building my startup from paradise in Bali. Love surfing in the morning before work.",
    interests: ["Surfing", "Entrepreneurship", "Wellness", "Technology"],
    currentMoods: ["Working", "Adventuring"],
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&q=80",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Created 5 days ago
    updatedAt: new Date().toISOString()
  }
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const newEvents = {
  "Mexico City": [
    {
      id: 1001,
      title: "Blanco Yoga Beachside Retreat",
      description: "Experience tranquility at our exclusive beachside yoga retreat in Blanco. Join us for a transformative session combining traditional yoga practices with panoramic ocean views. Perfect for all skill levels, this retreat offers a unique blend of mindfulness and natural beauty.",
      date: tomorrow.toISOString(),
      location: "Mexico City",
      category: "Sports",
      image: "/attached_assets/7358939e-2913-4b8f-a310-769736b37cba.jpg",
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
      title: "Intimate Expat Rooftop Dinner Experience",
      description: "Join us for an intimate dinner featuring seasonal ingredients and spectacular city views. Includes wine pairing and chef's introduction.",
      date: new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Mexico City",
      category: "Social",
      image: "/attached_assets/images-2.jpg",
      capacity: 30,
      price: 55,
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
      image: "/attached_assets/32440f72b6e2c1d310393fbfd13df870b2fffccb.webp",
      capacity: 400,
      price: 75,
      createdAt: new Date().toISOString(),
      interestedCount: 289
    },
    {
      id: 1007,
      title: "Zona Maco: Ancient Balloon Ride + Downtiempo DJs",
      description: "Experience the magic of ancient Mexico with hot air balloon rides over the pyramids and hacienda decompression. A unique cultural fundraiser featuring performances by Anastascia, Britta Arnold, Jose Noventa, and more. Join us for this extraordinary blend of adventure and culture.",
      date: new Date(2025, 1, 9).toISOString(), // February 9, 2025
      location: "Mexico City",
      category: "Cultural",
      image: "/attached_assets/b077eac1-ce55-495c-93ce-ba6dbfe5178f.jpg",
      capacity: 200,
      price: 150,
      createdAt: new Date().toISOString(),
      interestedCount: 156,
      tags: ["Nightlife", "Music", "Cultural", "Excursion"]
    },
    {
      id: 1008,
      title: "Zona MACO: Giggling Artweek",
      description: "Join us for a vibrant celebration of contemporary art in Mexico City. This exclusive artweek event brings together local and international artists for an unforgettable showcase of creativity and expression.",
      date: new Date(2025, 1, 8).toISOString(), // February 8, 2025
      location: "Mexico City",
      category: "Cultural",
      image: "/attached_assets/3a3e6886-307d-4eaf-b670-ad1662be61db.jpg",
      capacity: 150,
      price: 85,
      createdAt: new Date().toISOString(),
      interestedCount: 92,
      tags: ["Nightlife", "Cultural", "Art", "Excursion"]
    },
    {
      id: 1009,
      title: "Surreal Festival",
      description: "Experience a surreal journey in the breathtaking Valle de Bravo. A two-day immersive festival that blends art, music, and nature in a unique mountain setting. Get your full pass now and be part of this extraordinary event that pushes the boundaries of reality and imagination.",
      date: new Date(2025, 4, 2).toISOString(), // May 2, 2025
      location: "Mexico City",
      category: "Festivals",
      image: "/attached_assets/baac6810-cef8-4632-a20d-08ae3d08f3fc.jpg",
      capacity: 500,
      price: 200,
      createdAt: new Date().toISOString(),
      interestedCount: 324,
      tags: ["Music", "Art", "Nature"]
    },
    {
      id: 1010,
      title: "Oaxacan Cooking Class with Chef Colibri",
      description: "Join Chef Colibri for an intimate Oaxacan cooking masterclass where you'll learn the secrets of traditional Mexican cuisine. Master the art of making authentic mole, handmade tortillas, and other regional specialties. This hands-on experience includes a shared dining experience of your creations paired with selected Mexican wines.",
      date: new Date(tomorrow.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Mexico City",
      category: "Cultural",
      image: "/attached_assets/1670001512622.webp",
      capacity: 12,
      price: 60,
      createdAt: new Date().toISOString(),
      interestedCount: 42,
      tags: ["Cooking", "Culture", "Food & Wine"]
    },
    {
      id: 1011,
      title: "Female Padel Meetup Mexico City",
      description: "Join fellow female padel enthusiasts for an exciting meetup at our premium courts. Whether you're a beginner or experienced player, come enjoy a day of padel, socializing, and making new connections. Equipment rental available on site.",
      date: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Mexico City",
      category: "Sports",
      image: "/attached_assets/d3b6f0d009480e788baf989059d03ccf_grande.webp",
      capacity: 25,
      price: 35,
      createdAt: new Date().toISOString(),
      interestedCount: 18,
      tags: ["Sports", "Outdoors", "Social"]
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
      const gender = req.query.gender as string;
      const minAge = req.query.minAge ? parseInt(req.query.minAge as string) : undefined;
      const maxAge = req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined;
      const interests = req.query['interests[]'] as string[] | string;
      const moods = req.query['moods[]'] as string[] | string;
      const name = req.query.name as string;

      // Get users for specific city or all cities if none specified
      let filteredUsers = city && city !== 'all'
        ? MOCK_USERS[city] || []
        : Object.values(MOCK_USERS).flat();

      // Apply additional filters
      if (gender && gender !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.gender === gender);
      }

      if (minAge !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.age !== undefined && user.age >= minAge);
      }

      if (maxAge !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.age !== undefined && user.age <= maxAge);
      }

      if (interests) {
        const interestArray = Array.isArray(interests) ? interests : [interests];
        filteredUsers = filteredUsers.filter(user => 
          user.interests && interestArray.some(interest => user.interests?.includes(interest))
        );
      }

      if (moods) {
        const moodArray = Array.isArray(moods) ? moods : [moods];
        filteredUsers = filteredUsers.filter(user => 
          user.currentMoods && moodArray.some(mood => user.currentMoods?.includes(mood))
        );
      }

      if (name) {
        const lowercaseName = name.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          (user.fullName && user.fullName.toLowerCase().includes(lowercaseName)) ||
          (user.username && user.username.toLowerCase().includes(lowercaseName))
        );
      }

      // Sort by newest profiles first (based on createdAt date)
      filteredUsers.sort((a, b) => {
        // Ensure createdAt dates are valid
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      // Log sorted users for debugging
      console.log("Sorted users:", filteredUsers.map(u => ({ 
        name: u.fullName, 
        createdAt: u.createdAt,
        profileImage: u.profileImage 
      })));

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