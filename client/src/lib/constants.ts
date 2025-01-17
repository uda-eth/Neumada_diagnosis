import { type Event } from "@db/schema";

export const DIGITAL_NOMAD_CITIES = [
  "Amsterdam",
  "Bali",
  "Bangkok",
  "Barcelona",
  "Berlin",
  "Buenos Aires",
  "Cape Town",
  "Chiang Mai",
  "Dubai",
  "Ho Chi Minh City",
  "Kuala Lumpur",
  "Lisbon",
  "London",
  "Madrid",
  "Melbourne",
  "Mexico City",
  "Miami",
  "New York",
  "Porto",
  "Prague",
  "Singapore",
  "Stockholm",
  "Taipei",
  "Tokyo",
  "Vancouver"
].sort();

export const DEFAULT_CITY = "Mexico City";

// Sample event images - in production these would be actual URLs
const EVENT_IMAGES = {
  djParty: "/images/dj-party.jpg",
  hiking: "/images/hiking.jpg",
  dinner: "/images/dinner-party.jpg",
  art: "/images/art-gallery.jpg",
  yoga: "/images/yoga.jpg",
};

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
      price: 25,
      category: "Nightlife",
      creatorId: 1,
      capacity: 200,
      tags: ["Networking", "Music", "Nightlife"]
    },
    {
      id: Math.floor(Math.random() * 1000),
      title: "Weekend Hiking Adventure",
      description: "Escape the city and explore the beautiful trails around the area. Perfect for nature lovers and photography enthusiasts. All skill levels welcome!",
      date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: `Nature Reserve, ${city}`,
      image: EVENT_IMAGES.hiking,
      price: 15,
      category: "Adventure",
      creatorId: 2,
      capacity: 30,
      tags: ["Outdoor", "Adventure", "Nature"]
    },
    {
      id: Math.floor(Math.random() * 1000),
      title: "International Dinner Party",
      description: "Experience a unique culinary journey with fellow travelers. Each guest brings a dish from their home country, creating a truly international feast.",
      date: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: `Community Center, ${city}`,
      image: EVENT_IMAGES.dinner,
      price: 20,
      category: "Social",
      creatorId: 3,
      capacity: 50,
      tags: ["Food", "Social", "Culture"]
    },
    {
      id: Math.floor(Math.random() * 1000),
      title: "Digital Nomad Art Exhibition",
      description: "Discover amazing artworks created by traveling artists. Network with creative professionals while enjoying wine and refreshments.",
      date: new Date(Date.now() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: `Art District Gallery, ${city}`,
      image: EVENT_IMAGES.art,
      price: 30,
      category: "Arts",
      creatorId: 4,
      capacity: 100,
      tags: ["Art", "Culture", "Networking"]
    },
    {
      id: Math.floor(Math.random() * 1000),
      title: "Sunset Rooftop Yoga",
      description: "Join our mindful community for a relaxing yoga session with a breathtaking view. All levels welcome. Mats provided.",
      date: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: `Rooftop Garden, ${city}`,
      image: EVENT_IMAGES.yoga,
      price: 18,
      category: "Wellness",
      creatorId: 5,
      capacity: 40,
      tags: ["Yoga", "Wellness", "Singles"]
    }
  ];
  return acc;
}, {} as Record<string, Event[]>);

// Event categories for filtering
export const EVENT_CATEGORIES = [
  "Nightlife",
  "Adventure",
  "Social",
  "Arts",
  "Wellness",
  "Tech",
  "Business",
  "Sports"
];

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