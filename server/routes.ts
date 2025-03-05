import multer from 'multer';
import path from 'path';
import express from 'express';
import { createServer } from 'http';
import { setupAuth } from './auth';
import { handleChatMessage } from './chat';
import { findMatches } from './services/matchingService';
import { translateMessage } from './services/translationService';
import { getEventImage } from './services/eventsService';

const categories = [
  "Retail",
  "Fashion",
  "Social",
  "Cultural",
  "Sports",
  "Dining",
  "Festivals",
  "Professional"
];

const newEvents = {
  "Mexico City": [
    {
      id: 1013,
      title: "Octo Designer Sunglasses Pop-Up Launch Party",
      description: "Join us for an exclusive launch party celebrating Octo's latest collection of designer sunglasses. Experience the perfect fusion of style and sophistication in an intimate setting. Meet the designers behind the brand, enjoy curated cocktails, and be among the first to preview and purchase from this cutting-edge collection.\n\nSpecial features include:\n• First access to limited edition pieces\n• Live DJ sets\n• Signature cocktails\n• Professional styling sessions\n• Photo opportunities\n• Exclusive launch day discounts",
      date: new Date(2025, 2, 20, 19, 0), // March 20, 2025, 7:00 PM
      location: "Mexico City",
      category: "Retail",
      image: "/attached_assets/Screenshot 2025-03-04 at 10.37.43 PM.png",
      capacity: 100,
      price: 75,
      createdAt: new Date(),
      interestedCount: 42,
      tags: ["Retail", "Fashion", "Launch Party", "Luxury"],
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1012,
      title: "Pargot Restaurant Couples Food & Wine Pairing",
      description: "Experience an intimate evening of culinary excellence at Pargot Restaurant. This exclusive couples' event features a meticulously crafted six-course tasting menu paired with premium wines from around the world. Each dish is artfully prepared with locally-sourced ingredients and edible flowers, creating a feast for both the eyes and palate. Our expert sommelier will guide you through each pairing, explaining the unique characteristics that make each combination extraordinary.\n\nPerfect for date night or special celebrations, this intimate dining experience is limited to 12 couples to ensure personalized attention and an unforgettable evening.",
      date: new Date(2025, 2, 15, 19, 30), // March 15, 2025, 7:30 PM
      location: "Mexico City",
      category: "Dining",
      image: "/attached_assets/Screenshot 2025-03-04 at 10.35.46 PM.png",
      capacity: 24,
      price: 195,
      createdAt: new Date(),
      interestedCount: 18,
      tags: ["Food & Wine", "Date Night", "Fine Dining", "Couples"],
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1001,
      title: "Blanco Yoga Beachside Retreat",
      description: "Experience tranquility at our exclusive beachside yoga retreat in Blanco. Join us for a transformative session combining traditional yoga practices with panoramic ocean views. Perfect for all skill levels, this retreat offers a unique blend of mindfulness and natural beauty.",
      date: new Date(),
      location: "Mexico City",
      category: "Sports",
      image: "/attached_assets/7358939e-2913-4b8f-a310-769736b37cba.jpg",
      capacity: 20,
      price: 595,
      createdAt: new Date(),
      interestedCount: 28,
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1002,
      title: "Contemporary Mexican Art Exhibition",
      description: "Explore the vibrant world of contemporary Mexican artists at this exclusive gallery exhibition. Features works from emerging local talents.",
      date: new Date(),
      location: "Mexico City",
      category: "Cultural",
      image: "/attached_assets/art-gallery-event-stockcake.jpg",
      capacity: 50,
      price: 10,
      createdAt: new Date(),
      interestedCount: 25,
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1004,
      title: "Intimate Expat Rooftop Dinner Experience",
      description: "Join us for an intimate dinner featuring seasonal ingredients and spectacular city views. Includes wine pairing and chef's introduction.",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: "Mexico City",
      category: "Social",
      image: "/attached_assets/images-2.jpg",
      capacity: 30,
      price: 55,
      createdAt: new Date(),
      interestedCount: 42,
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1005,
      title: "Desierto de los Leones Hiking Adventure",
      description: "Explore the historic Desierto de los Leones National Park on this guided hiking tour. Perfect for nature enthusiasts and photography lovers.",
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      location: "Mexico City",
      category: "Sports",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop&q=80",
      capacity: 15,
      price: 45,
      createdAt: new Date(),
      interestedCount: 19,
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1006,
      title: "Nocturnal Rhythms: Adam Ten & Carlita",
      description: "Experience an unforgettable night of melodic house and techno with internationally acclaimed artists Adam Ten and Carlita. Set in an exclusive venue with state-of-the-art sound system and immersive lighting design.",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      location: "Mexico City",
      category: "Social",
      image: "/attached_assets/32440f72b6e2c1d310393fbfd13df870b2fffccb.webp",
      capacity: 400,
      price: 75,
      createdAt: new Date(),
      interestedCount: 289,
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1007,
      title: "Zona Maco: Ancient Balloon Ride + Downtiempo DJs",
      description: "Experience the magic of ancient Mexico with hot air balloon rides over the pyramids and hacienda decompression. A unique cultural fundraiser featuring performances by Anastascia, Britta Arnold, Jose Noventa, and more. Join us for this extraordinary blend of adventure and culture.",
      date: new Date(2025, 1, 9), // February 9, 2025
      location: "Mexico City",
      category: "Cultural",
      image: "/attached_assets/b077eac1-ce55-495c-93ce-ba6dbfe5178f.jpg",
      capacity: 200,
      price: 150,
      createdAt: new Date(),
      interestedCount: 156,
      tags: ["Nightlife", "Music", "Cultural", "Excursion"],
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1008,
      title: "Zona MACO: Giggling Artweek",
      description: "Join us for a vibrant celebration of contemporary art in Mexico City. This exclusive artweek event brings together local and international artists for an unforgettable showcase of creativity and expression.",
      date: new Date(2025, 1, 8), // February 8, 2025
      location: "Mexico City",
      category: "Cultural",
      image: "/attached_assets/3a3e6886-307d-4eaf-b670-ad1662be61db.jpg",
      capacity: 150,
      price: 85,
      createdAt: new Date(),
      interestedCount: 92,
      tags: ["Nightlife", "Cultural", "Art", "Excursion"],
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1009,
      title: "Surreal Festival",
      description: "Experience a surreal journey in the breathtaking Valle de Bravo. A two-day immersive festival that blends art, music, and nature in a unique mountain setting. Get your full pass now and be part of this extraordinary event that pushes the boundaries of reality and imagination.",
      date: new Date(2025, 4, 2), // May 2, 2025
      location: "Mexico City",
      category: "Festivals",
      image: "/attached_assets/baac6810-cef8-4632-a20d-08ae3d08f3fc.jpg",
      capacity: 500,
      price: 200,
      createdAt: new Date(),
      interestedCount: 324,
      tags: ["Music", "Art", "Nature"],
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1010,
      title: "Oaxacan Cooking Class with Chef Colibri",
      description: "Join Chef Colibri for an intimate Oaxacan cooking masterclass where you'll learn the secrets of traditional Mexican cuisine. Master the art of making authentic mole, handmade tortillas, and other regional specialties. This hands-on experience includes a shared dining experience of your creations paired with selected Mexican wines.",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: "Mexico City",
      category: "Cultural",
      image: "/attached_assets/1670001512622.webp",
      capacity: 12,
      price: 60,
      createdAt: new Date(),
      interestedCount: 42,
      tags: ["Cooking", "Culture", "Food & Wine"],
      interestedUsers: [] // Added interestedUsers array
    },
    {
      id: 1011,
      title: "Female Padel Meetup Mexico City",
      description: "Join fellow female padel enthusiasts for an exciting meetup at our premium courts. Whether you're a beginner or experienced player, come enjoy a day of padel, socializing, and making new connections. Equipment rental available on site.",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: "Mexico City",
      category: "Sports",
      image: "/attached_assets/d3b6f0d009480e788baf989059d03ccf_grande.webp",
      capacity: 25,
      price: 35,
      createdAt: new Date(),
      interestedCount: 18,
      tags: ["Sports", "Outdoors", "Social"],
      interestedUsers: [] // Added interestedUsers array
    }
  ]
};

const MOCK_USERS = {
  "Mexico City": [
    {
      id: 1009,
      username: "alexander_brand",
      fullName: "Alexander Reeves",
      age: 32,
      gender: "male",
      profession: "Luxury Brand Strategist",
      location: "Mexico City",
      bio: "Leading brand strategist specializing in luxury fashion and lifestyle. Currently spearheading the launch of Octo's designer eyewear collection in Mexico City. Passionate about connecting innovative designers with discerning audiences. Looking to collaborate with fashion photographers and creative directors.",
      interests: ["Luxury Fashion", "Brand Development", "Design", "Photography", "Art", "Networking"],
      currentMoods: ["Launching", "Creating", "Connecting"],
      profileImage: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      eventsHosting: [1013], // ID of the Octo Designer Sunglasses event
      featuredEvent: {
        id: 1013,
        title: "Octo Designer Sunglasses Pop-Up Launch Party",
        role: "Host & Brand Strategist"
      }
    }
  ]
};

// Add Alexander as an interested attendee to relevant events
Object.values(newEvents).forEach(cityEvents => {
  cityEvents.forEach(event => {
    if (event.category === "Fashion" || event.category === "Retail") {
      event.interestedUsers = event.interestedUsers || [];
      event.interestedUsers.push({
        id: 1009,
        name: "Alexander Reeves",
        image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png"
      });
    }
  });
});

const DIGITAL_NOMAD_CITIES = ["Mexico City"]; // Assuming this is defined elsewhere

// Update the MOCK_EVENTS object to include the new events
export const MOCK_EVENTS = DIGITAL_NOMAD_CITIES.reduce((acc, city) => {
  acc[city] = city === "Mexico City"
    ? [...(acc[city] || []), ...newEvents[city]]
    : (acc[city] || []);
  return acc;
}, {} as Record<string, any[]>);

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

export function registerRoutes(app: express.Application): Server {
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
      const matches = await findMatches(req.user as any); //Type assertion added here.
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