import { type Event } from "@db/schema";

// Cities organized by region, but stored in a flat array for the UI
export const DIGITAL_NOMAD_CITIES = [
  // North America
  "Mexico City",
  "Puerto Escondido",
  "New York City",
  "Miami",
  "Los Angeles",
  "Tulum",
  "Austin",
  "Toronto",
  
  // South & Central America
  "São Paulo",
  "Rio de Janeiro",
  "Costa Rica",
  "Medellín",
  "Buenos Aires",
  "Lima",
  "Cartagena",
  
  // Europe
  "Lisbon",
  "Barcelona",
  "Berlin",
  "Paris",
  "Amsterdam",
  "London",
  "Mykonos",
  "Ibiza",
  
  // Middle East
  "Dubai",
  "Tel Aviv",
  
  // Asia & Oceania
  "Bali",
  "Bangkok",
  "Tokyo",
  "Seoul",
  "Ho Chi Minh City",
  "Sydney"
];

export const DEFAULT_CITY = "Mexico City";

export const PROFILE_TYPES = [
  { id: "member", label: "Member" },
  { id: "business", label: "Business" },
  { id: "promoter", label: "Event Promoter" },
  { id: "non_profit", label: "Non-Profit Organization" }
];

// High-quality curated event images
const EVENT_IMAGES = {
  musicFestival: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&h=900&fit=crop&q=80",
  intimateDinner: "https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=1600&h=900&fit=crop&q=80",
  hiking: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&h=900&fit=crop&q=80",
  artGallery: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1600&h=900&fit=crop&q=80",
  beachYoga: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&h=900&fit=crop&q=80",
  coworking: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=1600&h=900&fit=crop&q=80",
  networking: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&h=900&fit=crop&q=80",
  workshop: "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=1600&h=900&fit=crop&q=80"
};

// Event categories for filtering
export const EVENT_CATEGORIES = [
  "Nightlife",
  "Adventure",
  "Social",
  "Arts",
  "Wellness",
  "Tech",
  "Business",
  "Sports",
  "Workshops",
  "Networking"
];

// Event types
export const EVENT_TYPES = [
  { id: "free", label: "Free Event" },
  { id: "paid", label: "Paid Event" },
  { id: "rsvp", label: "RSVP Required" }
];

// Update the MOCK_EVENTS object in constants.ts to ensure all events have prices
export const MOCK_EVENTS: Record<string, Event[]> = DIGITAL_NOMAD_CITIES.reduce((acc, city) => {
  acc[city] = [
    {
      id: Math.floor(Math.random() * 1000),
      title: "Giegling Music & Art Festival",
      description: "An unforgettable night of electronic music, art installations, and networking with fellow digital nomads.",
      date: new Date(2024, 8, 7, 18, 0), // Sept 7, 2024, 6pm
      location: `Downtown Festival Grounds, ${city}`,
      image: EVENT_IMAGES.musicFestival,
      image_url: EVENT_IMAGES.musicFestival,
      category: "Nightlife",
      creatorId: 1,
      capacity: 600,
      price: "250",
      ticketType: "paid",
      availableTickets: 586,
      isBusinessEvent: true,
      isPrivate: false,
      createdAt: new Date(),
      tags: ["Music", "Art", "Networking"],
      attendingCount: 14,
      interestedCount: 42
    },
    {
      id: Math.floor(Math.random() * 1000),
      title: "Intimate Dinner Party",
      description: "Join us for an exclusive culinary experience featuring local chefs and fellow nomads.",
      date: new Date(2024, 8, 7, 19, 0), // Sept 7, 2024, 7pm
      location: `Secret Garden Venue, ${city}`,
      image: EVENT_IMAGES.intimateDinner,
      image_url: EVENT_IMAGES.intimateDinner,
      category: "Social",
      creatorId: 2,
      capacity: 30,
      price: "75",
      ticketType: "rsvp",
      availableTickets: 28,
      isBusinessEvent: false,
      isPrivate: true,
      createdAt: new Date(),
      tags: ["Food", "Social", "Networking"],
      attendingCount: 2,
      interestedCount: 8
    },
    {
      id: Math.floor(Math.random() * 1000),
      title: "Hiking + Waterfall Daytrip",
      description: "Escape the city for a day of adventure, photography, and natural beauty.",
      date: new Date(2024, 8, 7, 8, 0), // Sept 7, 2024, 8am
      location: `Mountain Trails, ${city}`,
      image: EVENT_IMAGES.hiking,
      image_url: EVENT_IMAGES.hiking,
      category: "Adventure",
      creatorId: 3,
      capacity: 60,
      price: "50",
      ticketType: "paid",
      availableTickets: 56,
      isBusinessEvent: false,
      isPrivate: false,
      createdAt: new Date(),
      tags: ["Nature", "Adventure", "Photography"],
      attendingCount: 4,
      interestedCount: 12
    }
  ];
  return acc;
}, {} as Record<string, Event[]>);

// Interest tags for user profiles
export const INTEREST_TAGS = [
  "Digital Marketing",
  "Software Development",
  "Content Creation",
  "Photography",
  "Entrepreneurship",
  "Remote Work",
  "Travel",
  "Fitness",
  "Languages",
  "Art & Design",
  "Music",
  "Food & Cuisine"
];

export const MOOD_TAGS = [
  "Working",
  "Exploring",
  "Networking",
  "Learning",
  "Teaching",
  "Socializing",
  "Focusing",
  "Adventure",
  "Relaxing",
  "Creating"
];

export const MOCK_USER_PROFILES = {
  member: {
    profileType: "member",
    interests: ["Travel", "Photography", "Languages"],
    currentMoods: ["Exploring", "Networking"],
    bio: "Digital nomad exploring the world while working remotely"
  },
  business: {
    profileType: "business",
    businessName: "Remote Workspace Co.",
    businessDescription: "Premium coworking spaces for digital nomads",
    interests: ["Remote Work", "Entrepreneurship", "Networking"],
    currentMoods: ["Working", "Creating"]
  },
  promoter: {
    profileType: "promoter",
    businessName: "Global Events Network",
    businessDescription: "Connecting digital nomads through unforgettable experiences",
    interests: ["Events", "Networking", "Marketing"],
    currentMoods: ["Networking", "Creating"]
  },
  non_profit: {
    profileType: "non_profit",
    businessName: "Digital Nomad Foundation",
    businessDescription: "Supporting sustainable digital nomad communities worldwide",
    interests: ["Community", "Sustainability", "Education"],
    currentMoods: ["Teaching", "Creating"]
  }
};

export const CREATOR_PROFILE = {
  username: "lucahudek",
  fullName: "Luca Hudek",
  profession: "Digital Nomad Platform Creator",
  profileImage: "/attached_assets/Screenshot 2025-03-04 at 11.21.13 PM.png",
  location: "Mexico City",
  nextLocation: "Berlin",
  interests: ["Digital Marketing", "Software Development", "Remote Work", "Travel", "Photography"],
  currentMoods: ["Creating", "Networking", "Teaching"],
  birthLocation: "Vancouver",
  bio: "Creator and digital nomad connecting professionals globally through intelligent communication tools and AI-powered city exploration."
};