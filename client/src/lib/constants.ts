import { type Event } from "@db/schema";

export const DIGITAL_NOMAD_CITIES = [
  "Amsterdam", "Bali", "Bangkok", "Barcelona", "Berlin",
  "Buenos Aires", "Cape Town", "Chiang Mai", "Dubai",
  "Ho Chi Minh City", "Kuala Lumpur", "Lisbon", "London",
  "Madrid", "Melbourne", "Mexico City", "Miami", "New York",
  "Porto", "Prague", "Singapore", "Stockholm", "Taipei",
  "Tokyo", "Vancouver"
].sort();

export const DEFAULT_CITY = "Mexico City";

export const PROFILE_TYPES = [
  { id: "member", label: "Member" },
  { id: "business", label: "Business" },
  { id: "promoter", label: "Event Promoter" },
  { id: "non_profit", label: "Non-Profit Organization" }
];

// Sample event images - in production these would be actual URLs
const EVENT_IMAGES = {
  djParty: "/images/dj-party.jpg",
  hiking: "/images/hiking.jpg",
  dinner: "/images/dinner-party.jpg",
  art: "/images/art-gallery.jpg",
  yoga: "/images/yoga.jpg",
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

// Create sample events for each city
export const MOCK_EVENTS: Record<string, Event[]> = DIGITAL_NOMAD_CITIES.reduce((acc, city) => {
  acc[city] = [
    {
      id: Math.floor(Math.random() * 1000),
      title: "Digital Nomad DJ Night",
      description: "Join us for an unforgettable night of electronic music and networking with fellow digital nomads. Local and international DJs will be spinning the latest tracks while you connect with like-minded individuals.",
      date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: `Nightclub District, ${city}`,
      image: EVENT_IMAGES.djParty,
      category: "Nightlife",
      creatorId: 1,
      capacity: 200,
      ticketPrice: "25",
      ticketType: "paid",
      availableTickets: 150,
      isBusinessEvent: true,
      isPrivate: false,
      createdAt: new Date().toISOString()
    },
    {
      id: Math.floor(Math.random() * 1000),
      title: "Weekend Hiking Adventure",
      description: "Escape the city and explore the beautiful trails around the area. Perfect for nature lovers and photography enthusiasts. All skill levels welcome!",
      date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: `Nature Reserve, ${city}`,
      image: EVENT_IMAGES.hiking,
      category: "Adventure",
      creatorId: 2,
      capacity: 30,
      ticketPrice: "0",
      ticketType: "rsvp",
      availableTickets: 20,
      isBusinessEvent: false,
      isPrivate: false,
      createdAt: new Date().toISOString()
    },
    {
      id: Math.floor(Math.random() * 1000),
      title: "International Dinner Party",
      description: "Experience a unique culinary journey with fellow travelers. Each guest brings a dish from their home country, creating a truly international feast.",
      date: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: `Community Center, ${city}`,
      image: EVENT_IMAGES.dinner,
      category: "Social",
      creatorId: 3,
      capacity: 50,
      ticketPrice: "20",
      ticketType: "paid",
      availableTickets: 35,
      isBusinessEvent: false,
      isPrivate: false,
      createdAt: new Date().toISOString()
    },
    {
      id: Math.floor(Math.random() * 1000),
      title: "Digital Nomad Art Exhibition",
      description: "Discover amazing artworks created by traveling artists. Network with creative professionals while enjoying wine and refreshments.",
      date: new Date(Date.now() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: `Art District Gallery, ${city}`,
      image: EVENT_IMAGES.art,
      category: "Arts",
      creatorId: 4,
      capacity: 100,
      ticketPrice: "30",
      ticketType: "paid",
      availableTickets: 75,
      isBusinessEvent: true,
      isPrivate: false,
      createdAt: new Date().toISOString()
    },
    {
      id: Math.floor(Math.random() * 1000),
      title: "Sunset Rooftop Yoga",
      description: "Join our mindful community for a relaxing yoga session with a breathtaking view. All levels welcome. Mats provided.",
      date: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: `Rooftop Garden, ${city}`,
      image: EVENT_IMAGES.yoga,
      category: "Wellness",
      creatorId: 5,
      capacity: 40,
      ticketPrice: "18",
      ticketType: "paid",
      availableTickets: 25,
      isBusinessEvent: true,
      isPrivate: false,
      createdAt: new Date().toISOString()
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