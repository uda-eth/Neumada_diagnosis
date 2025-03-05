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
    name: "Luca Hudek",
    age: 44,
    location: "Mexico City",
    bio: "Founder of Māly. Building the future of digital nomad communities.",
    interests: ["Innovation", "Community Building", "Digital Nomads"],
    image: "/Screenshot 2025-02-24 at 2.22.24 PM.png",
    occupation: "Founder & CEO"
  },
  {
    id: 2,
    name: "Alexander",
    age: 32,
    location: "Barcelona",
    bio: "Digital nomad & creative director. Living between Barcelona and Berlin.",
    interests: ["Photography", "Art Direction", "Travel"],
    image: "/Screenshot 2023-11-12 at 1.04.38 PM.png",
    occupation: "Creative Director"
  },
  {
    id: 3,
    name: "Marco",
    age: 34,
    location: "Mexico City",
    bio: "Exploring the intersection of culture and design. Always on the move.",
    interests: ["Fashion", "Street Art", "Music"],
    image: "/Screenshot 2023-11-12 at 12.51.50 PM.png",
    occupation: "Fashion Designer"
  },
  {
    id: 4,
    name: "Maya",
    age: 29,
    location: "Los Angeles",
    bio: "Photographer and visual artist. Finding beauty in unexpected places.",
    interests: ["Visual Arts", "Festivals", "Spirituality"],
    image: "/Screenshot 2023-11-12 at 12.56.16 PM.png",
    occupation: "Photographer"
  },
  {
    id: 5,
    name: "Elena",
    age: 31,
    location: "New York",
    bio: "Tech entrepreneur with a passion for sustainable fashion.",
    interests: ["Tech", "Sustainability", "Fashion"],
    image: "/Screenshot 2023-11-14 at 9.24.34 AM.png",
    occupation: "Tech Entrepreneur"
  },
  {
    id: 6,
    name: "Sarah",
    age: 28,
    location: "Miami",
    bio: "Wellness coach and festival enthusiast. Living life in full color.",
    interests: ["Wellness", "Dance", "Events"],
    image: "/Screenshot 2024-03-06 at 12.19.10 PM.png",
    occupation: "Wellness Coach"
  },
  {
    id: 7,
    name: "Isabella",
    age: 26,
    location: "London",
    bio: "Art curator and cultural connector. Always seeking new perspectives.",
    interests: ["Art", "Culture", "Fashion"],
    image: "/Screenshot 2024-03-06 at 11.24.17 AM.png",
    occupation: "Art Curator"
  }
];