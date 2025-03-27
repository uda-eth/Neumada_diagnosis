import multer from 'multer';
import path from 'path';
import express, { Request, Response } from 'express';
import { createServer, Server } from 'http';
import { setupAuth } from './auth';
import { handleChatMessage } from './chat';
import { findMatches } from './services/matchingService';
import { translateMessage } from './services/translationService';
import { getEventImage } from './services/eventsService';
import { WebSocketServer } from 'ws';
import { sendMessage, getConversations, getMessages, markMessageAsRead, markAllMessagesAsRead } from './services/messagingService';
import { db } from "../db";
import { userCities, users, events, sessions, userConnections } from "../db/schema";
import { eq, ne, gte, lte, and, or } from "drizzle-orm";

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

// Update the MOCK_USERS object in routes.ts to use the new profile image
const MOCK_USERS = {
  "Mexico City": [
    {
      id: 1009,
      username: "lucahudek",
      fullName: "Luca Hudek",
      age: 32,
      gender: "male",
      profession: "Digital Nomad Platform Creator",
      location: "Mexico City",
      bio: "Creator and digital nomad connecting professionals globally through intelligent communication tools and AI-powered city exploration.",
      interests: ["Digital Marketing", "Software Development", "Remote Work", "Travel", "Photography"],
      currentMoods: ["Creating", "Networking", "Teaching"],
      profileImage: "/attached_assets/Screenshot 2025-03-04 at 11.21.13 PM.png",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      eventsHosting: [1013],
      featuredEvent: {
        id: 1013,
        title: "Octo Designer Sunglasses Pop-Up Launch Party",
        role: "Host & Brand Strategist"
      }
    },
    {
      id: 1010,
      username: "maria_design",
      fullName: "Maria Torres",
      profileImage: "/attached_assets/profile-image-1.jpg"
    },
    {
      id: 1011,
      username: "james_photo",
      fullName: "James Chen",
      profileImage: "/attached_assets/profile-image-2.jpg"
    },
    {
      id: 1012,
      username: "sara_creative",
      fullName: "Sara Johnson",
      profileImage: "/attached_assets/profile-image-3.jpg"
    },
    {
      id: 1013,
      username: "david_tech",
      fullName: "David Kim",
      profileImage: "/attached_assets/profile-image-4.jpg"
    }
  ]
};

// Update events to include prices
const newEvents = {
  "Mexico City": [
    {
      id: 1013,
      title: "Octo Designer Sunglasses Pop-Up Launch Party",
      description: "Join us for an exclusive launch party celebrating Octo's latest collection of designer sunglasses. Experience the perfect fusion of style and sophistication in an intimate setting. Meet the designers behind the brand, enjoy curated cocktails, and be among the first to preview and purchase from this cutting-edge collection.\n\nSpecial features include:\n• First access to limited edition pieces\n• Live DJ sets\n• Signature cocktails\n• Professional styling sessions\n• Photo opportunities\n• Exclusive launch day discounts",
      date: new Date(2025, 2, 20, 19, 0),
      location: "Mexico City",
      category: "Retail",
      image: "/attached_assets/Screenshot 2025-03-04 at 10.37.43 PM.png",
      capacity: 100,
      price: "75",
      createdAt: new Date(),
      interestedCount: 42,
      attendingCount: 15,
      tags: ["Retail", "Fashion", "Launch Party", "Luxury"],
      creatorId: 1009,
      creatorName: "Alexander Reeves",
      creatorImage: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png",
      attendingUsers: [
        {
          id: 1010,
          name: "Maria Torres",
          image: "/attached_assets/profile-image-1.jpg"
        },
        {
          id: 1011,
          name: "James Chen",
          image: "/attached_assets/profile-image-2.jpg"
        },
        {
          id: 1012,
          name: "Sara Johnson",
          image: "/attached_assets/profile-image-3.jpg"
        }
      ],
      interestedUsers: [
        {
          id: 1013,
          name: "David Kim",
          image: "/attached_assets/profile-image-4.jpg"
        },
        {
          id: 1014,
          name: "Lisa Park",
          image: "/attached_assets/profile-image-5.jpg"
        }
      ]
    },
    {
      id: 1012,
      title: "Pargot Restaurant Couples Food & Wine Pairing",
      description: "Experience an intimate evening of culinary excellence at Pargot Restaurant. This exclusive couples' event features a meticulously crafted six-course tasting menu paired with premium wines from around the world. Each dish is artfully prepared with locally-sourced ingredients and edible flowers, creating a feast for both the eyes and palate. Our expert sommelier will guide you through each pairing, explaining the unique characteristics that make each combination extraordinary.\n\nPerfect for date night or special celebrations, this intimate dining experience is limited to 12 couples to ensure personalized attention and an unforgettable evening.",
      date: new Date(2025, 2, 15, 19, 30),
      location: "Mexico City",
      category: "Dining",
      image: "/attached_assets/Screenshot 2025-03-04 at 10.35.46 PM.png",
      capacity: 24,
      price: "195",
      createdAt: new Date(),
      interestedCount: 18,
      attendingCount: 6,
      tags: ["Food & Wine", "Date Night", "Fine Dining", "Couples"],
      creatorId: 1010,
      creatorName: "Maria Torres",
      creatorImage: "/attached_assets/profile-image-1.jpg",
      attendingUsers: [
        { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
        { id: 1011, name: "James Chen", image: "/attached_assets/profile-image-2.jpg" },
        { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
        { id: 1013, name: "David Kim", image: "/attached_assets/profile-image-4.jpg" },
        { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
        { id: 1015, name: "John Smith", image: "/attached_assets/profile-image-6.jpg" }
      ],
      interestedUsers: [
        { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" }
      ]
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
      price: "595",
      createdAt: new Date(),
      interestedCount: 28,
      attendingCount: 10,
      interestedUsers: [
        { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
        { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
        { id: 1013, name: "David Kim", image: "/attached_assets/profile-image-4.jpg" }
      ],
      attendingUsers: [
        { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
        { id: 1011, name: "James Chen", image: "/attached_assets/profile-image-2.jpg" },
        { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
        { id: 1015, name: "John Smith", image: "/attached_assets/profile-image-6.jpg" },
        { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" },
        { id: 1017, name: "Peter Jones", image: "/attached_assets/profile-image-8.jpg" },
        { id: 1018, name: "Susan Brown", image: "/attached_assets/profile-image-9.jpg" },
        { id: 1019, name: "Mike Davis", image: "/attached_assets/profile-image-10.jpg" },
        { id: 1020, name: "Emily Wilson", image: "/attached_assets/profile-image-11.jpg" },
        { id: 1021, name: "Kevin Garcia", image: "/attached_assets/profile-image-12.jpg" }
      ],
      tags: ["Yoga", "Retreat", "Wellness", "Beach"]
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
      price: "10",
      createdAt: new Date(),
      interestedCount: 25,
      attendingCount: 12,
      tags: ["Art", "Culture", "Exhibition"],
      creatorId: 1012,
      creatorName: "Sara Johnson",
      creatorImage: "/attached_assets/profile-image-3.jpg",
      attendingUsers: [
        { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
        { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
        { id: 1011, name: "James Chen", image: "/attached_assets/profile-image-2.jpg" },
        { id: 1013, name: "David Kim", image: "/attached_assets/profile-image-4.jpg" },
        { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
        { id: 1015, name: "John Smith", image: "/attached_assets/profile-image-6.jpg" },
        { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" },
        { id: 1017, name: "Peter Jones", image: "/attached_assets/profile-image-8.jpg" },
        { id: 1018, name: "Susan Brown", image: "/attached_assets/profile-image-9.jpg" },
        { id: 1019, name: "Mike Davis", image: "/attached_assets/profile-image-10.jpg" },
        { id: 1020, name: "Emily Wilson", image: "/attached_assets/profile-image-11.jpg" },
        { id: 1021, name: "Kevin Garcia", image: "/attached_assets/profile-image-12.jpg" }
      ],
      interestedUsers: [
        { id: 1022, name: "Jessica Brown", image: "/attached_assets/profile-image-13.jpg" }
      ]
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
      price: "55",
      createdAt: new Date(),
      interestedCount: 42,
      attendingCount: 18,
      tags: ["Dinner", "Rooftop", "Social", "Expats"],
      creatorId: 1011,
      creatorName: "James Chen",
      creatorImage: "/attached_assets/profile-image-2.jpg",
      attendingUsers: [
        { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
        { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
        { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
        { id: 1013, name: "David Kim", image: "/attached_assets/profile-image-4.jpg" },
        { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
        { id: 1015, name: "John Smith", image: "/attached_assets/profile-image-6.jpg" },
        { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" },
        { id: 1017, name: "Peter Jones", image: "/attached_assets/profile-image-8.jpg" },
        { id: 1018, name: "Susan Brown", image: "/attached_assets/profile-image-9.jpg" },
        { id: 1019, name: "Mike Davis", image: "/attached_assets/profile-image-10.jpg" },
        { id: 1020, name: "Emily Wilson", image: "/attached_assets/profile-image-11.jpg" },
        { id: 1021, name: "Kevin Garcia", image: "/attached_assets/profile-image-12.jpg" },
        { id: 1022, name: "Jessica Brown", image: "/attached_assets/profile-image-13.jpg" },
        { id: 1023, name: "Robert Lee", image: "/attached_assets/profile-image-14.jpg" },
        { id: 1024, name: "Ashley Green", image: "/attached_assets/profile-image-15.jpg" },
        { id: 1025, name: "William White", image: "/attached_assets/profile-image-16.jpg" },
        { id: 1026, name: "Amanda Black", image: "/attached_assets/profile-image-17.jpg" },
        { id: 1027, name: "Brian Brown", image: "/attached_assets/profile-image-18.jpg" }
      ],
      interestedUsers: [
        { id: 1028, name: "Sarah White", image: "/attached_assets/profile-image-19.jpg" }
      ]
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
      price: "45",
      createdAt: new Date(),
      interestedCount: 19,
      attendingCount: 8,
      tags: ["Hiking", "Nature", "Outdoors"],
      creatorId: 1013,
      creatorName: "David Kim",
      creatorImage: "/attached_assets/profile-image-4.jpg",
      attendingUsers: [
        { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
        { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
        { id: 1011, name: "James Chen", image: "/attached_assets/profile-image-2.jpg" },
        { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
        { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
        { id: 1015, name: "John Smith", image: "/attached_assets/profile-image-6.jpg" },
        { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" },
        { id: 1017, name: "Peter Jones", image: "/attached_assets/profile-image-8.jpg" }
      ],
      interestedUsers: [
        { id: 1022, name: "Jessica Brown", image: "/attached_assets/profile-image-13.jpg" },
        { id: 1028, name: "Sarah White", image: "/attached_assets/profile-image-19.jpg" }
      ]
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
      price: "75",
      createdAt: new Date(),
      interestedCount: 289,
      attendingCount: 150,
      tags: ["Music", "Techno", "House", "Nightlife"],
      creatorId: 1014,
      creatorName: "Lisa Park",
      creatorImage: "/attached_assets/profile-image-5.jpg",
      attendingUsers: [
        { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
        { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
        { id: 1011, name: "James Chen", image: "/attached_assets/profile-image-2.jpg" },
        { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
        { id: 1013, name: "David Kim", image: "/attached_assets/profile-image-4.jpg" },
        { id: 1015, name: "John Smith", image: "/attached_assets/profile-image-6.jpg" },
        { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" },
        { id: 1017, name: "Peter Jones", image: "/attached_assets/profile-image-8.jpg" },
        { id: 1018, name: "Susan Brown", image: "/attached_assets/profile-image-9.jpg" },
        { id: 1019, name: "Mike Davis", image: "/attached_assets/profile-image-10.jpg" },
        { id: 1020, name: "Emily Wilson", image: "/attached_assets/profile-image-11.jpg" },
        { id: 1021, name: "Kevin Garcia", image: "/attached_assets/profile-image-12.jpg" },
        { id: 1022, name: "Jessica Brown", image: "/attached_assets/profile-image-13.jpg" },
        { id: 1023, name: "Robert Lee", image: "/attached_assets/profile-image-14.jpg" },
        { id: 1024, name: "Ashley Green", image: "/attached_assets/profile-image-15.jpg" },
        { id: 1025, name: "William White", image: "/attached_assets/profile-image-16.jpg" },
        { id: 1026, name: "Amanda Black", image: "/attached_assets/profile-image-17.jpg" },
        { id: 1027, name: "Brian Brown", image: "/attached_assets/profile-image-18.jpg" },
        { id: 1028, name: "Sarah White", image: "/attached_assets/profile-image-19.jpg" },
        { id: 1029, name: "Christopher Black", image: "/attached_assets/profile-image-20.jpg" },
        { id: 1030, name: "Angela White", image: "/attached_assets/profile-image-21.jpg" },
        { id: 1031, name: "David Lee", image: "/attached_assets/profile-image-22.jpg" },
        { id: 1032, name: "Jessica Green", image: "/attached_assets/profile-image-23.jpg" },
        { id: 1033, name: "William Brown", image: "/attached_assets/profile-image-24.jpg" },
        { id: 1034, name: "Amanda Jones", image: "/attached_assets/profile-image-25.jpg" },
        { id: 1035, name: "Brian White", image: "/attached_assets/profile-image-26.jpg" },
        { id: 1036, name: "Sarah Black", image: "/attached_assets/profile-image-27.jpg" },
        { id: 1037, name: "Christopher Green", image: "/attached_assets/profile-image-28.jpg" },
        { id: 1038, name: "Angela Brown", image: "/attached_assets/profile-image-29.jpg" },
        { id: 1039, name: "David White", image: "/attached_assets/profile-image-30.jpg" },
        { id: 1040, name: "Jessica Lee", image: "/attached_assets/profile-image-31.jpg" },
        { id: 1041, name: "William Black", image: "/attached_assets/profile-image-32.jpg" },
        { id: 1042, name: "Amanda Green", image: "/attached_assets/profile-image-33.jpg" },
        { id: 1043, name: "Brian Jones", image: "/attached_assets/profile-image-34.jpg" },
        { id: 1044, name: "Sarah Brown", image: "/attached_assets/profile-image-35.jpg" },
        { id: 1045, name: "Christopher White", image: "/attached_assets/profile-image-36.jpg" },
        { id: 1046, name: "Angela Lee", image: "/attached_assets/profile-image-37.jpg" },
        { id: 1047, name: "David Black", image: "/attached_assets/profile-image-38.jpg" },
        { id: 1048, name: "Jessica Jones", image: "/attached_assets/profile-image-39.jpg" },
        { id: 1049, name: "William Green", image: "/attached_assets/profile-image-40.jpg" },
        { id: 1050, name: "Amanda Brown", image: "/attached_assets/profile-image-41.jpg" }
      ],
      interestedUsers: [
        { id: 1051, name: "Robert White", image: "/attached_assets/profile-image-42.jpg" }
      ]
    },
    {
      id: 1007,
      title: "Zona Maco: Ancient Balloon Ride + Downtiempo DJs",
      description: "Experience the magic of ancient Mexico with hot air balloon rides over the pyramids and hacienda decompression. A unique cultural fundraiser featuring performances by Anastascia, Britta Arnold, Jose Noventa, and more. Join us for this extraordinary blend of adventure and culture.",
      date: new Date(2025, 1, 9),
      location: "Mexico City",
      category: "Cultural",
      image: "/attached_assets/b077eac1-ce55-495c-93ce-ba6dbfe5178f.jpg",
      capacity: 200,
      price: "150",
      createdAt: new Date(),
      interestedCount: 156,
      attendingCount: 75,
      tags: ["Nightlife", "Music", "Cultural", "Excursion"],
      creatorId: 1015,
      creatorName: "John Smith",
      creatorImage: "/attached_assets/profile-image-6.jpg",
      attendingUsers: [
        { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
        { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
        { id: 1011, name: "James Chen", image: "/attached_assets/profile-image-2.jpg" },
        { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
        { id: 1013, name: "David Kim", image: "/attached_assets/profile-image-4.jpg" },
        { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
        { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" },
        { id: 1017, name: "Peter Jones", image: "/attached_assets/profile-image-8.jpg" },
        { id: 1018, name: "Susan Brown", image: "/attached_assets/profile-image-9.jpg" },
        { id: 1019, name: "Mike Davis", image: "/attached_assets/profile-image-10.jpg" },
        { id: 1020, name: "Emily Wilson", image: "/attached_assets/profile-image-11.jpg" },
        { id: 1021, name: "Kevin Garcia", image: "/attached_assets/profile-image-12.jpg" },
        { id: 1022, name: "Jessica Brown", image: "/attached_assets/profile-image-13.jpg" },
        { id: 1023, name: "Robert Lee", image: "/attached_assets/profile-image-14.jpg" },
        { id: 1024, name: "Ashley Green", image: "/attached_assets/profile-image-15.jpg" },
        { id: 1025, name: "William White", image: "/attached_assets/profile-image-16.jpg" },
        { id: 1026, name: "Amanda Black", image: "/attached_assets/profile-image-17.jpg" },
        { id: 1027, name: "Brian Brown", image: "/attached_assets/profile-image-18.jpg" },
        { id: 1028, name: "Sarah White", image: "/attached_assets/profile-image-19.jpg" },
        { id: 1029, name: "Christopher Black", image: "/attached_assets/profile-image-20.jpg" },
        { id: 1030, name: "Angela White", image: "/attached_assets/profile-image-21.jpg" },
        { id: 1031, name: "David Lee", image: "/attached_assets/profile-image-22.jpg" },
        { id: 1032, name: "Jessica Green", image: "/attached_assets/profile-image-23.jpg" },
        { id: 1033, name: "William Brown", image: "/attached_assets/profile-image-24.jpg" },
        { id: 1034, name: "Amanda Jones", image: "/attached_assets/profile-image-25.jpg" },
        { id: 1035, name: "Brian White", image: "/attached_assets/profile-image-26.jpg" },
        { id: 1036, name: "Sarah Black", image: "/attached_assets/profile-image-27.jpg" },
        { id: 1037, name: "Christopher Green", image: "/attached_assets/profile-image-28.jpg" },
        { id: 1038, name: "Angela Brown", image: "/attached_assets/profile-image-29.jpg" },
        { id: 1039, name: "David White", image: "/attached_assets/profile-image-30.jpg" },
        { id: 1040, name: "Jessica Lee", image: "/attached_assets/profile-image-31.jpg" },
        { id: 1041, name: "William Black", image: "/attached_assets/profile-image-32.jpg" },
        { id: 1042, name: "Amanda Green", image: "/attached_assets/profile-image-33.jpg" },
        { id: 1043, name: "Brian Jones", image: "/attached_assets/profile-image-34.jpg" },
        { id: 1044, name: "Sarah Brown", image: "/attached_assets/profile-image-35.jpg" },
        { id: 1045, name: "Christopher White", image: "/attached_assets/profile-image-36.jpg" },
        { id: 1046, name: "Angela Lee", image: "/attached_assets/profile-image-37.jpg" },
        { id: 1047, name: "David Black", image: "/attached_assets/profile-image-38.jpg" },
        { id: 1048, name: "Jessica Jones", image: "/attached_assets/profile-image-39.jpg" },
        { id: 1049, name: "William Green", image: "/attached_assets/profile-image-40.jpg" },
        { id: 1050, name: "Amanda Brown", image: "/attached_assets/profile-image-41.jpg" },
        { id: 1051, name: "Robert White", image: "/attached_assets/profile-image-42.jpg" },
        { id: 1052, name: "Ashley Black", image: "/attached_assets/profile-image-43.jpg" },
        { id: 1053, name: "William Jones", image: "/attached_assets/profile-image-44.jpg" },
        { id: 1054, name: "Amanda White", image: "/attached_assets/profile-image-45.jpg" },
        { id: 1055, name: "Brian Lee", image: "/attached_assets/profile-image-46.jpg" },
        { id: 1056, name: "Sarah Jones", image: "/attached_assets/profile-image-47.jpg" },
        { id: 1057, name: "Christopher Brown", image: "/attached_assets/profile-image-48.jpg" },
        { id: 1058, name: "Angela Green", image: "/attached_assets/profile-image-49.jpg" },
        { id: 1059, name: "David Jones", image: "/attached_assets/profile-image-50.jpg" },
        { id: 1060, name: "Jessica Black", image: "/attached_assets/profile-image-51.jpg" }
      ],
      interestedUsers: [
        { id: 1061, name: "Robert Green", image: "/attached_assets/profile-image-52.jpg" }
      ]
    },
    {
      id: 1008,
      title: "Zona MACO: Giggling Artweek",
      description: "Join us for a vibrant celebration of contemporary art in Mexico City. This exclusive artweek event brings together local and international artists for an unforgettable showcase of creativity and expression.",
      date: new Date(2025, 1, 8),
      location: "Mexico City",
      category: "Cultural",
      image: "/attached_assets/3a3e6886-307d-4eaf-b670-ad1662be61db.jpg",
      capacity: 150,
      price: "85",
      createdAt: new Date(),
      interestedCount: 92,
      attendingCount: 46,
      tags: ["Nightlife", "Cultural", "Art", "Excursion"],
      creatorId: 1016,
      creatorName: "Jane Doe",
      creatorImage: "/attached_assets/profile-image-7.jpg",
      attendingUsers: [
        { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
        { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
        { id: 1011, name: "James Chen", image: "/attached_assets/profile-image-2.jpg" },
        { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
        { id: 1013, name: "David Kim", image: "/attached_assets/profile-image-4.jpg" },
        { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
        { id: 1015, name: "John Smith", image: "/attached_assets/profile-image-6.jpg" },
        { id: 1017, name: "Peter Jones", image: "/attached_assets/profile-image-8.jpg" },
        { id: 1018, name: "Susan Brown", image: "/attached_assets/profile-image-9.jpg" },
        { id: 1019, name: "Mike Davis", image: "/attached_assets/profile-image-10.jpg" },
        { id: 1020, name: "Emily Wilson", image: "/attached_assets/profile-image-11.jpg" },
        { id: 1021, name: "Kevin Garcia", image: "/attached_assets/profile-image-12.jpg" },
        { id: 1022, name: "Jessica Brown", image: "/attached_assets/profile-image-13.jpg" },
        { id: 1023, name: "Robert Lee", image: "/attached_assets/profile-image-14.jpg" },
        { id: 1024, name: "Ashley Green", image: "/attached_assets/profile-image-15.jpg" },
        { id: 1025, name: "William White", image: "/attached_assets/profile-image-16.jpg" },
        { id: 1026, name: "Amanda Black", image: "/attached_assets/profile-image-17.jpg" },
        { id: 1027, name: "Brian Brown", image: "/attached_assets/profile-image-18.jpg" },
        { id: 1028, name: "Sarah White", image: "/attached_assets/profile-image-19.jpg" },
        { id: 1029, name: "Christopher Black", image: "/attached_assets/profile-image-20.jpg" },
        { id: 1030, name: "Angela White", image: "/attached_assets/profile-image-21.jpg" },
        { id: 1031, name: "David Lee", image: "/attached_assets/profile-image-22.jpg" },
        { id: 1032, name: "Jessica Green", image: "/attached_assets/profile-image-23.jpg" },
        { id: 1033, name: "William Brown", image: "/attached_assets/profile-image-24.jpg" },
        { id: 1034, name: "Amanda Jones", image: "/attached_assets/profile-image-25.jpg" },
        { id: 1035, name: "Brian White", image: "/attached_assets/profile-image-26.jpg" },
        { id: 1036, name: "Sarah Black", image: "/attached_assets/profile-image-27.jpg" },
        { id: 1037, name: "Christopher Green", image: "/attached_assets/profile-image-28.jpg" },
        { id: 1038, name: "Angela Brown", image: "/attached_assets/profile-image-29.jpg" },
        { id: 1039, name: "David White", image: "/attached_assets/profile-image-30.jpg" },
        { id: 1040, name: "Jessica Lee", image: "/attached_assets/profile-image-31.jpg" },
        { id: 1041, name: "William Black", image: "/attached_assets/profile-image-32.jpg" },
        { id: 1042, name: "Amanda Green", image: "/attached_assets/profile-image-33.jpg" },
        { id: 1043, name: "Brian Jones", image: "/attached_assets/profile-image-34.jpg" },
        { id: 1044, name: "Sarah Brown", image: "/attached_assets/profile-image-35.jpg" },
        { id: 1045, name: "Christopher White", image: "/attached_assets/profile-image-36.jpg" },
        { id: 1046, name: "Angela Lee", image: "/attached_assets/profile-image-37.jpg" },
        { id: 1047, name: "David Black", image: "/attached_assets/profile-image-38.jpg" },
        { id: 1048, name: "Jessica Jones", image: "/attached_assets/profile-image-39.jpg" },
        { id: 1049, name: "William Green", image: "/attached_assets/profile-image-40.jpg" },
        { id: 1050, name: "Amanda Brown", image: "/attached_assets/profile-image-41.jpg" },
        { id: 1051, name: "Robert White", image: "/attached_assets/profile-image-42.jpg" },
        { id: 1052, name: "Ashley Black", image: "/attached_assets/profile-image-43.jpg" },
        { id: 1053, name: "William Jones", image: "/attached_assets/profile-image-44.jpg" },
        { id: 1054, name: "Amanda White", image: "/attached_assets/profile-image-45.jpg" },
        { id: 1055, name: "Brian Lee", image: "/attached_assets/profile-image-46.jpg" },
        { id: 1056, name: "Sarah Jones", image: "/attached_assets/profile-image-47.jpg" },
        { id: 1057, name: "Christopher Brown", image: "/attached_assets/profile-image-48.jpg" },
        { id: 1058, name: "Angela Green", image: "/attached_assets/profile-image-49.jpg" },
        { id: 1059, name: "David Jones", image: "/attached_assets/profile-image-50.jpg" },
        { id: 1060, name: "Jessica Black", image: "/attached_assets/profile-image-51.jpg" }
      ],
      interestedUsers: [
        { id: 1061, name: "Robert Green", image: "/attached_assets/profile-image-52.jpg" },
        { id: 1062, name: "Ashley Jones", image: "/attached_assets/profile-image-53.jpg" }
      ]
    },
    {
      id: 1009,
      title: "Surreal Festival",
      description: "Experience a surreal journey in the breathtaking Valle de Bravo. A two-day immersive festival that blends art, music, and nature in a unique mountain setting. Get your full pass now and be part of this extraordinary event that pushes the boundaries of reality and imagination.",
      date: new Date(2025, 4, 2),
      location: "Mexico City",
      category: "Festivals",
      image: "/attached_assets/Screenshot 2025-03-06 at 11.00.33 AM.png",
      capacity: 500,
      price: "200",
      createdAt: new Date(),
      interestedCount: 324,
      attendingCount: 162,
      tags: ["Music", "Art", "Nature"],
      creatorId: 1017,
      creatorName: "Peter Jones",
      creatorImage: "/attached_assets/profile-image-8.jpg",
      attendingUsers: [
        { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
        { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
        { id: 1011, name: "James Chen", image: "/attached_assets/profile-image-2.jpg" },
        { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
        { id: 1013, name: "David Kim", image: "/attached_assets/profile-image-4.jpg" },
        { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
        { id: 1015, name: "John Smith", image: "/attached_assets/profile-image-6.jpg" },
        { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" },
        { id: 1018, name: "Susan Brown", image: "/attached_assets/profile-image-9.jpg" },
        { id: 1019, name: "Mike Davis", image: "/attached_assets/profile-image-10.jpg" },
        { id: 1020, name: "Emily Wilson", image: "/attached_assets/profile-image-11.jpg" },
        { id: 1021, name: "Kevin Garcia", image: "/attached_assets/profile-image-12.jpg" },
        { id: 1022, name: "Jessica Brown", image: "/attached_assets/profile-image-13.jpg" },
        { id: 1023, name: "Robert Lee", image: "/attached_assets/profile-image-14.jpg" },
        { id: 1024, name: "Ashley Green", image: "/attached_assets/profile-image-15.jpg" },
        { id: 1025, name: "William White", image: "/attached_assets/profile-image-16.jpg" },
        { id: 1026, name: "Amanda Black", image: "/attached_assets/profile-image-17.jpg" },
        { id: 1027, name: "Brian Brown", image: "/attached_assets/profile-image-18.jpg" },
        { id: 1028, name: "Sarah White", image: "/attached_assets/profile-image-19.jpg" },
        { id: 1029, name: "Christopher Black", image: "/attached_assets/profile-image-20.jpg" },
        { id: 1030, name: "Angela White", image: "/attached_assets/profile-image-21.jpg" },
        { id: 1031, name: "David Lee", image: "/attached_assets/profile-image-22.jpg" },
        { id: 1032, name: "Jessica Green", image: "/attached_assets/profile-image-23.jpg" },
        { id: 1033, name: "William Brown", image: "/attached_assets/profile-image-24.jpg" },
        { id: 1034, name: "Amanda Jones", image: "/attached_assets/profile-image-25.jpg" },
        { id: 1035, name: "Brian White", image: "/attached_assets/profile-image-26.jpg" },
        { id: 1036, name: "Sarah Black", image: "/attached_assets/profile-image-27.jpg" },
        { id: 1037, name: "Christopher Green", image: "/attached_assets/profile-image-28.jpg" },
        { id: 1038, name: "Angela Brown", image: "/attached_assets/profile-image-29.jpg" },
        { id: 1039, name: "David White", image: "/attached_assets/profile-image-30.jpg" },
        { id: 1040, name: "Jessica Lee", image: "/attached_assets/profile-image-31.jpg" },
        { id: 1041, name: "William Black", image: "/attached_assets/profile-image-32.jpg" },
        { id: 1042, name: "Amanda Green", image: "/attached_assets/profile-image-33.jpg" },
        { id: 1043, name: "Brian Jones", image: "/attached_assets/profile-image-34.jpg" },
        { id: 1044, name: "Sarah Brown", image: "/attached_assets/profile-image-35.jpg" },
        { id: 1045, name: "Christopher White", image: "/attached_assets/profile-image-36.jpg" },
        { id: 1046, name: "Angela Lee", image: "/attached_assets/profile-image-37.jpg" },
        { id: 1047, name: "David Black", image: "/attached_assets/profile-image-38.jpg" },
        { id: 1048, name: "Jessica Jones", image: "/attached_assets/profile-image-39.jpg" },
        { id: 1049, name: "William Green", image: "/attached_assets/profile-image-40.jpg" },
        { id: 1050, name: "Amanda Brown", image: "/attached_assets/profile-image-41.jpg" },
        { id: 1051, name: "Robert White", image: "/attached_assets/profile-image-42.jpg" },
        { id: 1052, name: "Ashley Black", image: "/attached_assets/profile-image-43.jpg" },
        { id: 1053, name: "William Jones", image: "/attached_assets/profile-image-44.jpg" },
        { id: 1054, name: "Amanda White", image: "/attached_assets/profile-image-45.jpg" },
        { id: 1055, name: "Brian Lee", image: "/attached_assets/profile-image-46.jpg" },
        { id: 1056, name: "Sarah Jones", image: "/attached_assets/profile-image-47.jpg" },
        { id: 1057, name: "Christopher Brown", image: "/attached_assets/profile-image-48.jpg" },
        { id: 1058, name: "Angela Green", image: "/attached_assets/profile-image-49.jpg" },
        { id: 1059, name: "David Jones", image: "/attached_assets/profile-image-50.jpg" },
        { id: 1060, name: "Jessica Black", image: "/attached_assets/profile-image-51.jpg" },
        { id: 1061, name: "Robert Green", image: "/attached_assets/profile-image-52.jpg" },
        { id: 1062, name: "Ashley Jones", image: "/attached_assets/profile-image-53.jpg" },
        { id: 1063, name: "William Brown", image: "/attached_assets/profile-image-54.jpg" },
        { id: 1064, name: "Amanda Lee", image: "/attached_assets/profile-image-55.jpg" },
        { id: 1065, name: "Brian Black", image: "/attached_assets/profile-image-56.jpg" },
        { id: 1066, name: "Sarah Green", image: "/attached_assets/profile-image-57.jpg" },
        { id: 1067, name: "Christopher Jones", image: "/attached_assets/profile-image-58.jpg" },
        { id: 1068, name: "Angela Brown", image: "/attached_assets/profile-image-59.jpg" },
        { id: 1069, name: "David Green", image: "/attached_assets/profile-image-60.jpg" },
        { id: 1070, name: "Jessica Jones", image: "/attached_assets/profile-image-61.jpg" },
        { id: 1071, name: "William White", image: "/attached_assets/profile-image-62.jpg" },
        { id: 1072, name: "Amanda Black", image: "/attached_assets/profile-image-63.jpg" },
        { id: 1073, name: "Brian Lee", image: "/attached_assets/profile-image-64.jpg" },
        { id: 1074, name: "Sarah Jones", image: "/attached_assets/profile-image-65.jpg" },
        { id: 1075, name: "Christopher Brown", image: "/attached_assets/profile-image-66.jpg" },
        { id: 1076, name: "Angela Green", image: "/attached_assets/profile-image-67.jpg" },
        { id: 1077, name: "David Jones", image: "/attached_assets/profile-image-68.jpg" },
        { id: 1078, name: "Jessica Black", image: "/attached_assets/profile-image-69.jpg" },
        { id: 1079, name: "Robert Green", image: "/attached_assets/profile-image-70.jpg" },
        { id: 1080, name: "Ashley Jones", image: "/attached_assets/profile-image-71.jpg" }
      ],
      interestedUsers: [
        { id: 1081, name: "Robert Brown", image: "/attached_assets/profile-image-72.jpg" }
      ]
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
      price: "60",
      createdAt: new Date(),
      interestedCount: 42,
      attendingCount: 10,
      tags: ["Cooking", "Culture", "Food & Wine"],
      creatorId: 1018,
      creatorName: "Susan Brown",
      creatorImage: "/attached_assets/profile-image-9.jpg",
      attendingUsers: [
        { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
        { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
        { id: 1011, name: "James Chen", image: "/attached_assets/profile-image-2.jpg" },
        { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
        { id: 1013, name: "David Kim", image: "/attached_assets/profile-image-4.jpg" },
        { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
        { id: 1015, name: "John Smith", image: "/attached_assets/profile-image-6.jpg" },
        { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" },
        { id: 1017, name: "Peter Jones", image: "/attached_assets/profile-image-8.jpg" },
        { id: 1020, name: "Emily Wilson", image: "/attached_assets/profile-image-11.jpg" }
      ],
      interestedUsers: [
        { id: 1021, name: "Kevin Garcia", image: "/attached_assets/profile-image-12.jpg" },
        { id: 1022, name: "Jessica Brown", image: "/attached_assets/profile-image-13.jpg" }
      ]
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
      price: "35",
      createdAt: new Date(),
      interestedCount: 18,
      attendingCount: 7,
      tags: ["Sports", "Outdoors", "Social"],
      creatorId: 1019,
      creatorName: "Mike Davis",
      creatorImage: "/attached_assets/profile-image-10.jpg",
      attendingUsers: [
        { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
        { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
        { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
        { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" },
        { id: 1018, name: "Susan Brown", image: "/attached_assets/profile-image-9.jpg" },
        { id: 1020, name: "Emily Wilson", image: "/attached_assets/profile-image-11.jpg" },
        { id: 1022, name: "Jessica Brown", image: "/attached_assets/profile-image-13.jpg" }
      ],
      interestedUsers: [
        { id: 1021, name: "Kevin Garcia", image: "/attached_assets/profile-image-12.jpg" },
        { id: 1023, name: "Robert Lee", image: "/attached_assets/profile-image-14.jpg" }
      ]
    }
  ]
};

// Add attending and interested users to all events
Object.values(newEvents).forEach(cityEvents => {
  cityEvents.forEach(event => {
    if (!event.attendingUsers) {
      event.attendingUsers = [
        {
          id: 1010,
          name: "Maria Torres",
          image: "/attached_assets/profile-image-1.jpg"
        },
        {
          id: 1011,
          name: "James Chen",
          image: "/attached_assets/profile-image-2.jpg"
        }
      ];
    }
    if (!event.interestedUsers) {
      event.interestedUsers = [
        {
          id: 1012,
          name: "Sara Johnson",
          image: "/attached_assets/profile-image-3.jpg"
        }
      ];
    }
    if (!event.attendingCount) {
      event.attendingCount = event.attendingUsers.length;
    }
  });
});

const DIGITAL_NOMAD_CITIES = ["Mexico City"];

// Update the MOCK_EVENTS object to include the new events
export const MOCK_EVENTS = DIGITAL_NOMAD_CITIES.reduce((acc, city) => {
  acc[city] = city === "Mexico City"
    ? [...(acc[city] || []), ...newEvents[city]]
    : (acc[city] || []);
  return acc;
}, {} as Record<string, any[]>);

// Ensure uploads directory exists
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'));
    }
  }
});

// Type definitions
interface User {
  id: number;
  username: string;
  fullName: string;
  age?: number;
  gender?: string;
  profession?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  currentMoods?: string[];
  profileImage: string;
  createdAt?: string;
  updatedAt?: string;
  eventsHosting?: number[];
  featuredEvent?: {
    id: number;
    title: string;
    role: string;
  };
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  category: string;
  image: string;
  image_url?: string | null;
  capacity: number;
  price: number;
  createdAt: Date;
  interestedCount: number;
  attendingCount: number;
  tags: string[];
  creatorId: number;
  creatorName: string;
  creatorImage: string;
  attendingUsers: Array<{
    id: number;
    name: string;
    image: string;
  }>;
  interestedUsers: Array<{
    id: number;
    name: string;
    image: string;
  }>;
}

// Express app setup
const app = express();
app.use(express.json());

// Add your routes here
app.get('/api/events/:city', (req: Request, res: Response) => {
  const city = req.params.city;
  const cityEvents = newEvents[city as keyof typeof newEvents] || [];
  res.json(cityEvents);
});

app.get('/api/users/:city', (req: Request, res: Response) => {
  const city = req.params.city;
  const cityUsers = MOCK_USERS[city as keyof typeof MOCK_USERS] || [];
  res.json(cityUsers);
});


// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ 
    authenticated: false, 
    message: "You need to be logged in to access this resource" 
  });
}

// No redirect middleware - just returns authentication status
async function checkAuthentication(req: Request, res: Response) {
  // Check for session ID in headers (from the X-Session-ID header)
  const headerSessionId = req.headers['x-session-id'] as string;
  
  // Also check for session ID in cookies as a fallback
  const cookieSessionId = req.cookies?.sessionId || req.cookies?.maly_session_id;

  // Use header session ID first, then fall back to cookie
  const sessionId = headerSessionId || cookieSessionId;
  console.log("Session ID in /api/auth/check:", sessionId);
  
  // Debug session ID sources
  console.log("Auth check session sources:", {
    fromHeader: headerSessionId ? "yes" : "no",
    fromCookie: cookieSessionId ? "yes" : "no",
    finalSessionId: sessionId
  });

  // First check if user is authenticated through passport session
  if (req.isAuthenticated() && req.user) {
    console.log("Auth check: User is authenticated via passport");
    // Return authentication status with user data
    return res.json({ 
      authenticated: true,
      user: req.user
    });
  }
  
  // If not authenticated via passport, try with the provided session ID
  if (sessionId) {
    try {
      // Find the user ID in the session
      const sessionQuery = await db.select().from(sessions).where(eq(sessions.id, sessionId));
      
      if (sessionQuery.length > 0 && sessionQuery[0].userId) {
        // Find the user by ID
        const userId = sessionQuery[0].userId;
        const userQuery = await db.select().from(users).where(eq(users.id, userId));
        
        if (userQuery.length > 0) {
          const user = userQuery[0];
          console.log("Auth check: User authenticated via session ID:", user.username);
          
          // Remove sensitive information
          const { password, ...userWithoutPassword } = user as any;
          
          return res.json({
            authenticated: true,
            user: userWithoutPassword
          });
        }
      }
    } catch (err) {
      console.error("Auth check error with session ID:", err);
    }
  }
  
  // Return unauthenticated status if all methods fail
  console.log("Auth check: User not authenticated");
  return res.json({ 
    authenticated: false,
    message: "Not logged in"
  });
}

export function registerRoutes(app: express.Application): { app: express.Application; httpServer: Server } {
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

  setupAuth(app);

  // API endpoint for city suggestions
  app.post("/api/suggest-city", async (req: Request, res: Response) => {
    try {
      const { city, email, reason } = req.body;
      
      if (!city || !email) {
        return res.status(400).json({ 
          success: false, 
          message: "City name and email are required" 
        });
      }

      console.log(`City suggestion received: ${city}, Email: ${email}, Reason: ${reason || 'Not provided'}`);
      
      // Save the suggestion to the database using the userCities table
      // We set isActive to false so these suggestions won't be displayed in the UI
      try {
        await db.insert(userCities).values({
          city,
          userId: null, // No user associated (anonymous suggestion)
          email,
          reason: reason || null,
          isActive: false, // Mark as inactive - won't be shown in the UI
          createdAt: new Date()
        });
      } catch (dbError) {
        console.error("Database error saving suggestion:", dbError);
        // Continue even if DB save fails - we already logged the suggestion
      }

      return res.status(200).json({
        success: true,
        message: "Thank you for your suggestion! We'll notify you when we add support for this city."
      });
    } catch (error) {
      console.error("Error saving city suggestion:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while submitting your suggestion."
      });
    }
  });

  app.post("/api/chat", handleChatMessage);

  app.get("/api/users/browse", async (req, res) => {
    try {
      const city = req.query.city as string;
      const gender = req.query.gender as string;
      const minAge = req.query.minAge ? parseInt(req.query.minAge as string) : undefined;
      const maxAge = req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined;
      const interests = req.query['interests[]'] as string[] | string;
      const moods = req.query['moods[]'] as string[] | string;
      const name = req.query.name as string;
      const currentUserId = req.user?.id || req.query.currentUserId as string;

      // Database query to get real users
      let query = db.select().from(users);
      
      // Always exclude the current user from results
      if (currentUserId) {
        query = query.where(ne(users.id, parseInt(currentUserId.toString())));
      }
      
      // Don't include the current user in the results
      if (currentUserId) {
        query = query.where(ne(users.id, currentUserId));
      }
      
      // Apply filters to query
      if (city && city !== 'all') {
        query = query.where(eq(users.location, city));
      }
      
      if (gender && gender !== 'all') {
        query = query.where(eq(users.gender, gender));
      }
      
      if (minAge !== undefined) {
        query = query.where(gte(users.age, minAge));
      }
      
      if (maxAge !== undefined) {
        query = query.where(lte(users.age, maxAge));
      }
      
      // Get all users with the applied filters
      let dbUsers = await query;
      
      // Further filtering that's harder to do at the DB level
      if (interests) {
        const interestArray = Array.isArray(interests) ? interests : [interests];
        dbUsers = dbUsers.filter(user => 
          user.interests && interestArray.some(interest => 
            user.interests?.includes(interest)
          )
        );
      }
      
      if (moods) {
        const moodArray = Array.isArray(moods) ? moods : [moods];
        dbUsers = dbUsers.filter(user => 
          user.currentMoods && moodArray.some(mood => 
            user.currentMoods?.includes(mood)
          )
        );
      }
      
      if (name) {
        const lowercaseName = name.toLowerCase();
        dbUsers = dbUsers.filter(user =>
          (user.fullName && user.fullName.toLowerCase().includes(lowercaseName)) ||
          (user.username && user.username.toLowerCase().includes(lowercaseName))
        );
      }

      // Sort users by most recently created first
      dbUsers.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      console.log(`Found ${dbUsers.length} real users in database`);

      res.json(dbUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      
      // First, try to get user from the database
      const dbUser = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      
      if (dbUser && dbUser.length > 0) {
        console.log("Found real user in database:", dbUser[0].username);
        return res.json(dbUser[0]);
      }
      
      // If not found in DB, fallback to mock data while we're developing
      const mockUser = Object.values(MOCK_USERS)
        .flat()
        .find(u => u.username === username);

      if (!mockUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(mockUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  app.get("/api/matches", async (req, res) => {
    try {
      const matches = await findMatches(req.user as any);
      res.json(matches);
    } catch (error) {
      console.error("Error finding matches:", error);
      res.status(500).json({ error: "Failed to find matches" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const { location } = req.query;
      const currentUserId = req.user?.id;

      console.log("Fetching events with params:", { location, currentUserId });
      
      // Query events from the database
      let query = db.select().from(events);
      
      // Apply location filter if provided and not 'all'
      if (location && location !== 'all' && location !== '') {
        console.log(`Filtering events by location: ${location}`);
        query = query.where(eq(events.location, location as string));
      } else {
        console.log("No location filter applied, showing all events");
      }
      
      // Get all events that match the criteria
      let dbEvents = await query;
      console.log(`Found ${dbEvents.length} events in database before filtering`);
      
      // Filter out draft events that don't belong to the current user
      dbEvents = dbEvents.filter(event => {
        // If the event is not a draft, or if it's a draft created by the current user, include it
        return !event.isDraft || (event.isDraft && event.creatorId === currentUserId);
      });
      
      console.log(`After filtering drafts, ${dbEvents.length} events remain`);
      
      // Sort events by date (most recent first)
      dbEvents.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Descending order (most recent first)
      });

      // Check if we found any events
      if (dbEvents.length === 0) {
        console.log("No events found in database, using mock data temporarily");
        // Return empty array instead of falling back to mock data
        return res.json([]);
      }

      console.log(`Returning ${dbEvents.length} events from database`);
      return res.json(dbEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ 
        error: "Failed to fetch events",
        details: error.message
      });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);
      const currentUserId = req.user?.id;
      
      // Try to get event from the database
      const dbEvent = await db.select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);
      
      if (dbEvent && dbEvent.length > 0) {
        const event = dbEvent[0];
        
        // Check if the event is a draft and if the current user is the creator
        if (event.isDraft && event.creatorId !== currentUserId) {
          return res.status(403).json({ error: "You don't have access to this draft event" });
        }
        
        console.log("Found event in database:", event.title);
        return res.json(event);
      }
      
      // If not found in database, fall back to mock data during development
      const allEvents = Object.values(MOCK_EVENTS).flat();
      const mockEvent = allEvents.find(e => e.id === eventId);

      if (!mockEvent) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(mockEvent);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", upload.single('image'), async (req, res) => {
    try {
      // Get session ID from all possible sources
      const headerSessionId = req.headers['x-session-id'] as string;
      const cookieSessionId = req.cookies?.sessionId || req.cookies?.maly_session_id;
      
      // Use the first available session ID
      const sessionId = headerSessionId || cookieSessionId;
      console.log("Event creation using session ID:", sessionId);
      
      if (!sessionId) {
        console.log("No session ID provided for event creation");
        return res.status(401).json({ error: "Authentication required" });
      }

      // Find session and associated user
      const [session] = await db.select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (!session?.userId) {
        return res.status(401).json({ error: "Invalid session" });
      }

      // Get user details
      const [currentUser] = await db.select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (!currentUser) {
        return res.status(401).json({ error: "User not found" });
      }

      console.log("User authenticated for event creation:", currentUser.username);
      
      // Final authentication check
      if (!currentUser) {
        console.log("Authentication failed via all methods");
        return res.status(401).json({ error: "You must be logged in to create events" });
      }
      
      console.log("Event creation request received from user:", currentUser.username);
      console.log("Form data:", req.body);
      console.log("File:", req.file);
      
      // Required field validation
      if (!req.body.title || !req.body.description || !req.body.location) {
        return res.status(400).json({ 
          error: "Missing required fields",
          details: "Title, description, and location are required"
        });
      }
      
      // Parse the incoming form data with proper validation
      let tags = [];
      try {
        if (req.body.tags) {
          tags = JSON.parse(req.body.tags);
        }
      } catch (e) {
        console.warn("Failed to parse tags JSON:", e);
        // Default to empty array if parsing fails
      }
      
      // Process price (making sure it's a number)
      let price = 0;
      try {
        price = parseFloat(req.body.price || '0');
        if (isNaN(price)) price = 0;
      } catch (e) {
        console.warn("Invalid price format:", e);
        price = 0;
      }
      
      // Create event data object with all required fields from schema
      const eventData = {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        category: req.body.category || 'Social',
        ticketType: req.body.price && parseFloat(req.body.price) > 0 ? 'paid' : 'free',
        capacity: parseInt(req.body.capacity || '10'),
        price: price,
        date: new Date(req.body.date || new Date()),
        tags: tags,
        image: req.file ? `/uploads/${req.file.filename}` : getEventImage(req.body.category || 'Social'),
        image_url: req.file ? `/uploads/${req.file.filename}` : getEventImage(req.body.category || 'Social'),
        creatorId: currentUser.id,
        isDraft: req.body.isDraft === 'true',
        isPrivate: req.body.isPrivate === 'true',
        createdAt: new Date(),
        city: req.body.city || req.body.location || 'Mexico City',
        attendingCount: 0,
        interestedCount: 0,
        stripeProductId: null,
        stripePriceId: null
      };
      
      console.log(`Creating new ${eventData.isDraft ? 'draft' : 'published'} event:`, eventData.title);
      
      // Insert the event into the database
      const result = await db.insert(events).values(eventData).returning();
      
      if (result && result.length > 0) {
        console.log(`Event successfully saved to database with ID: ${result[0].id}`);
        return res.status(201).json({
          success: true,
          message: eventData.isDraft ? "Event saved as draft" : "Event published successfully",
          event: result[0]
        });
      } else {
        throw new Error("Database operation did not return an event ID");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ 
        error: "Failed to create event", 
        details: error.message || "Unknown database error" 
      });
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

  app.post('/api/messages', async (req: Request, res: Response) => {
    try {
      const { senderId, receiverId, content } = req.body;
      const message = await sendMessage({ senderId, receiverId, content });
      res.json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  app.get('/api/conversations/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const conversations = await getConversations(parseInt(userId));
      res.json(conversations);
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  });

  app.get('/api/messages/:userId/:otherId', async (req: Request, res: Response) => {
    try {
      const { userId, otherId } = req.params;
      const messages = await getMessages(parseInt(userId), parseInt(otherId));
      res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  app.post('/api/messages/:messageId/read', async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const message = await markMessageAsRead(parseInt(messageId));
      res.json(message);
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });

  app.post('/api/messages/read-all/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const messages = await markAllMessagesAsRead(parseInt(userId));
      res.json(messages);
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      res.status(500).json({ error: 'Failed to mark all messages as read' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws'
  });
  
  // Add authentication check endpoint that specifically looks for the session ID from various sources
  app.get('/api/auth/check', async (req, res) => {
    try {
      // Check all possible sources for the session ID
      const headerSessionId = req.headers['x-session-id'] as string;
      const cookieSessionId = req.cookies?.sessionId || req.cookies?.maly_session_id;
      
      // Also check localStorage - Passport may store it in 'maly_session_id'
      console.log("Looking for session ID in request");
      
      // Use the first available session ID
      const sessionId = headerSessionId || cookieSessionId;
      console.log("Auth check using session ID:", sessionId);
      
      // If we don't have a session ID, use the regular auth flow
      if (!sessionId) {
        console.log("No session ID found, falling back to standard auth check");
        return checkAuthentication(req, res);
      }
      
      // Look up session directly if we have a session ID
      const sessionQuery = await db.select().from(sessions).where(eq(sessions.id, sessionId));
      
      if (sessionQuery.length > 0 && sessionQuery[0].userId) {
        // Get the user info from the database
        const userId = sessionQuery[0].userId;
        console.log("Found session in database with user ID:", userId);
        
        const userQuery = await db.select().from(users).where(eq(users.id, userId));
        
        if (userQuery.length > 0) {
          const user = userQuery[0];
          console.log("Auth check: User authenticated via session ID directly:", user.username);
          
          // Remove sensitive information
          const { password, ...userWithoutPassword } = user as any;
          
          return res.json({
            authenticated: true,
            user: userWithoutPassword
          });
        }
      }
      
      // Fall back to the standard authentication check if session lookup failed
      return checkAuthentication(req, res);
    } catch (error) {
      console.error("Error in auth check endpoint:", error);
      return res.status(500).json({
        authenticated: false,
        error: "Server error during authentication check"
      });
    }
  });
  
  // Add endpoint to get user by session ID
  app.get('/api/user-by-session', async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      console.log("User by session request for sessionID:", sessionId);
      
      if (!sessionId) {
        return res.status(401).json({
          error: "No session ID provided",
          authenticated: false
        });
      }
      
      // Find the user ID in the session
      const sessionQuery = await db.select().from(sessions).where(eq(sessions.id, sessionId));
      
      if (sessionQuery.length === 0 || !sessionQuery[0].userId) {
        console.log("No user found in session:", sessionId);
        return res.status(401).json({
          error: "Session not found or invalid",
          authenticated: false
        });
      }
      
      // Find the user by ID
      const userId = sessionQuery[0].userId;
      const userQuery = await db.select().from(users).where(eq(users.id, userId));
      
      if (userQuery.length === 0) {
        console.log("User not found for ID:", userId);
        return res.status(404).json({
          error: "User not found",
          authenticated: false
        });
      }
      
      // Remove sensitive information before returning user
      const { password, ...userWithoutPassword } = userQuery[0] as any;
      
      console.log("User found by session ID:", userWithoutPassword.username);
      return res.json({
        ...userWithoutPassword,
        authenticated: true
      });
    } catch (error) {
      console.error("Error in user-by-session endpoint:", error);
      return res.status(500).json({
        error: "Server error",
        authenticated: false
      });
    }
  });

  // Connection related endpoints
  
  // Send a connection request
  app.post('/api/connections/request', async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User | undefined;
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { targetUserId } = req.body;
      
      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID is required' });
      }
      
      // Check if request already exists
      const existingConnection = await db.query.userConnections.findFirst({
        where: and(
          eq(userConnections.followerId, currentUser.id),
          eq(userConnections.followingId, targetUserId)
        )
      });
      
      if (existingConnection) {
        return res.status(400).json({ 
          error: 'Connection request already exists', 
          status: existingConnection.status 
        });
      }
      
      // Create new connection request
      const newConnection = await db.insert(userConnections).values({
        followerId: currentUser.id,
        followingId: targetUserId,
        status: 'pending',
        createdAt: new Date()
      }).returning();
      
      res.status(201).json({
        message: 'Connection request sent successfully',
        connection: newConnection[0]
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      res.status(500).json({ error: 'Failed to send connection request' });
    }
  });
  
  // Get pending connection requests (received by current user)
  app.get('/api/connections/pending', async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User | undefined;
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Get all pending requests where the current user is the target
      const pendingRequests = await db.query.userConnections.findMany({
        where: and(
          eq(userConnections.followingId, currentUser.id),
          eq(userConnections.status, 'pending')
        ),
        with: {
          follower: true
        }
      });
      
      // Format the response
      const formattedRequests = pendingRequests.map(request => ({
        id: request.follower.id,
        username: request.follower.username,
        fullName: request.follower.fullName,
        profileImage: request.follower.profileImage,
        requestDate: request.createdAt,
        status: request.status
      }));
      
      res.json(formattedRequests);
    } catch (error) {
      console.error('Error fetching pending connection requests:', error);
      res.status(500).json({ error: 'Failed to fetch pending connection requests' });
    }
  });
  
  // Accept or decline a connection request
  app.put('/api/connections/:userId', async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User | undefined;
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { userId } = req.params;
      const { status } = req.body;
      
      if (!status || (status !== 'accepted' && status !== 'declined')) {
        return res.status(400).json({ error: 'Valid status (accepted or declined) is required' });
      }
      
      // Update the connection status
      const updatedConnection = await db
        .update(userConnections)
        .set({ status })
        .where(
          and(
            eq(userConnections.followerId, parseInt(userId)),
            eq(userConnections.followingId, currentUser.id),
            eq(userConnections.status, 'pending')
          )
        )
        .returning();
      
      if (!updatedConnection || updatedConnection.length === 0) {
        return res.status(404).json({ error: 'Connection request not found' });
      }
      
      res.json({
        message: `Connection request ${status}`,
        connection: updatedConnection[0]
      });
    } catch (error) {
      console.error('Error updating connection request:', error);
      res.status(500).json({ error: 'Failed to update connection request' });
    }
  });
  
  // Get all connections (accepted only)
  app.get('/api/connections', async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User | undefined;
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Get connections where current user is either follower or following
      const connections = await db.query.userConnections.findMany({
        where: and(
          or(
            eq(userConnections.followerId, currentUser.id),
            eq(userConnections.followingId, currentUser.id)
          ),
          eq(userConnections.status, 'accepted')
        ),
        with: {
          follower: true,
          following: true
        }
      });
      
      // Format the response to show the other user in each connection
      const formattedConnections = connections.map(connection => {
        const isFollower = connection.followerId === currentUser.id;
        const otherUser = isFollower ? connection.following : connection.follower;
        
        return {
          id: otherUser.id,
          username: otherUser.username,
          fullName: otherUser.fullName,
          profileImage: otherUser.profileImage,
          connectionDate: connection.createdAt,
          connectionType: isFollower ? 'following' : 'follower'
        };
      });
      
      res.json(formattedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      res.status(500).json({ error: 'Failed to fetch connections' });
    }
  });
  
  // Check connection status between current user and another user
  app.get('/api/connections/status/:userId', async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User | undefined;
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { userId } = req.params;
      const targetUserId = parseInt(userId);
      
      // Check outgoing connection (current user -> target user)
      const outgoingConnection = await db.query.userConnections.findFirst({
        where: and(
          eq(userConnections.followerId, currentUser.id),
          eq(userConnections.followingId, targetUserId)
        )
      });
      
      // Check incoming connection (target user -> current user)
      const incomingConnection = await db.query.userConnections.findFirst({
        where: and(
          eq(userConnections.followerId, targetUserId),
          eq(userConnections.followingId, currentUser.id)
        )
      });
      
      res.json({
        outgoing: outgoingConnection ? {
          status: outgoingConnection.status,
          date: outgoingConnection.createdAt
        } : null,
        incoming: incomingConnection ? {
          status: incomingConnection.status,
          date: incomingConnection.createdAt
        } : null
      });
    } catch (error) {
      console.error('Error checking connection status:', error);
      res.status(500).json({ error: 'Failed to check connection status' });
    }
  });
  
  return { app, httpServer };
}