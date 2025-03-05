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
    image: "/attached_assets/Screenshot 2025-02-24 at 2.22.24 PM.png",
    occupation: "Founder & CEO"
  },
  {
    id: 2,
    name: "Adrian",
    age: 28,
    location: "Barcelona",
    bio: "Digital nomad & creative director, bringing art to life through visual storytelling and innovative design.",
    interests: ["Photography", "Art Direction", "Travel"],
    image: "/attached_assets/Screenshot 2023-11-12 at 1.04.38 PM.png",
    occupation: "Creative Director"
  },
  {
    id: 3,
    name: "Sofia",
    age: 29,
    location: "Tulum",
    bio: "Festival artist and spiritual guide. Creating immersive experiences in sacred spaces.",
    interests: ["Festivals", "Spirituality", "Art"],
    image: "/attached_assets/Screenshot 2023-11-12 at 12.56.16 PM.png",
    occupation: "Festival Artist"
  },
  {
    id: 4,
    name: "Isabella",
    age: 26,
    location: "Mexico City",
    bio: "Creative content producer from Brazil, capturing stories through the lens of culture and art.",
    interests: ["Content Creation", "Photography", "Cultural Exchange"],
    image: "/attached_assets/Screenshot 2025-03-04 at 8.28.10 PM.png",
    occupation: "Content Producer"
  },
  {
    id: 5,
    name: "Gabe Tavera",
    age: 44,
    location: "Austin",
    bio: "LA-born yogi now based in Austin, sharing wellness and mindful living practices.",
    interests: ["Yoga", "Wellness", "Mindfulness"],
    image: "/attached_assets/Screenshot 2025-03-04 at 8.30.13 PM.png",
    occupation: "Yoga Instructor"
  },
  {
    id: 6,
    name: "Samuel Garcia",
    age: 50,
    location: "Mexico City",
    bio: "Entrepreneur and community leader fostering connections in Mexico City's vibrant scene.",
    interests: ["Networking", "Business", "Community"],
    image: "/attached_assets/Screenshot 2025-03-04 at 8.31.15 PM.png",
    occupation: "Entrepreneur"
  },
  {
    id: 7,
    name: "Carlo",
    age: 35,
    location: "Mexico City",
    bio: "Performance artist and creative visionary exploring the intersection of art and technology.",
    interests: ["Performance Art", "Digital Art", "Innovation"],
    image: "/attached_assets/Screenshot 2025-03-04 at 8.32.34 PM.png",
    occupation: "Performance Artist"
  }
];