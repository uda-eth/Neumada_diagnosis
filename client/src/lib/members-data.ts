import { type } from "os";

export interface Member {
  id: number;
  name: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  image: string;
  occupation: string;
}

export const members: Member[] = [
  {
    id: 1,
    name: "Adrian",
    age: 28,
    location: "Barcelona",
    bio: "Digital nomad & creative director, bringing art to life through visual storytelling and innovative design.",
    interests: ["Photography", "Art Direction", "Travel"],
    image: "/Screenshot 2023-11-12 at 1.04.38 PM.png",
    occupation: "Creative Director"
  },
  {
    id: 2,
    name: "Sofia",
    age: 29,
    location: "Tulum",
    bio: "Festival artist and spiritual guide. Creating immersive experiences in sacred spaces.",
    interests: ["Festivals", "Spirituality", "Art"],
    image: "/Screenshot 2023-11-12 at 12.56.16 PM.png",
    occupation: "Festival Artist"
  },
  {
    id: 3,
    name: "Luca Hudek",
    age: 44,
    location: "Mexico City",
    bio: "Founder of Māly. Building the future of digital nomad communities.",
    interests: ["Innovation", "Community Building", "Digital Nomads"],
    image: "/Screenshot 2025-02-24 at 2.22.24 PM.png",
    occupation: "Founder & CEO"
  },
  {
    id: 4,
    name: "Ravi",
    age: 32,
    location: "Mexico City",
    bio: "Fashion designer exploring cultural fusion in modern streetwear.",
    interests: ["Fashion Design", "Street Culture", "Art"],
    image: "/Screenshot 2023-11-12 at 12.51.50 PM.png",
    occupation: "Fashion Designer"
  },
  {
    id: 5,
    name: "Isabella",
    age: 31,
    location: "New York",
    bio: "Tech entrepreneur with a passion for sustainable fashion and community.",
    interests: ["Tech", "Sustainability", "Fashion"],
    image: "/Screenshot 2023-11-14 at 9.24.34 AM.png",
    occupation: "Tech Entrepreneur"
  },
  {
    id: 6,
    name: "Kai",
    age: 33,
    location: "Tokyo",
    bio: "Digital artist and design consultant. Bridging cultures through creativity.",
    interests: ["Digital Art", "Design", "Culture"],
    image: "/Screenshot 2023-11-14 at 9.27.40 AM.png",
    occupation: "Digital Artist"
  },
  {
    id: 7,
    name: "Nina",
    age: 26,
    location: "Berlin",
    bio: "Visual storyteller and art curator. Finding beauty in urban spaces.",
    interests: ["Photography", "Art Curation", "Urban Culture"],
    image: "/Screenshot 2024-03-06 at 11.24.17 AM.png",
    occupation: "Art Curator"
  },
  {
    id: 8,
    name: "Maya",
    age: 28,
    location: "Miami",
    bio: "Wellness entrepreneur and yoga instructor. Living mindfully.",
    interests: ["Wellness", "Yoga", "Community"],
    image: "/Screenshot 2024-03-06 at 12.19.10 PM.png",
    occupation: "Wellness Coach"
  }
];