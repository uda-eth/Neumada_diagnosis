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
    name: "Adrian",
    age: 28,
    location: "Barcelona",
    bio: "Digital nomad & creative director, bringing art to life through visual storytelling and innovative design.",
    interests: ["Photography", "Art Direction", "Travel"],
    image: "/Screenshot 2023-11-12 at 1.04.38 PM.png",
    occupation: "Creative Director"
  },
  {
    id: 3,
    name: "Sofia",
    age: 29,
    location: "Tulum",
    bio: "Festival artist and spiritual guide. Creating immersive experiences in sacred spaces.",
    interests: ["Festivals", "Spirituality", "Art"],
    image: "/Screenshot 2023-11-12 at 12.56.16 PM.png",
    occupation: "Festival Artist"
  }
];