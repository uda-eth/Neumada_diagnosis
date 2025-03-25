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
import { userCities, users, events, eventParticipants } from "../db/schema";
import { eq, ne, gte, lte, or, asc, and, count } from "drizzle-orm";

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
function checkAuthentication(req: Request, res: Response) {
  if (req.isAuthenticated()) {
    // Return authentication status without redirect
    return res.json({ 
      authenticated: true,
      user: req.user
    });
  }
  
  // Return unauthenticated status
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

      // In a real app, you would insert into the database
      // For now, we'll just log the suggestion
      console.log(`City suggestion received: ${city}, Email: ${email}, Reason: ${reason || 'Not provided'}`);
      
      // Here you would normally save to database using something like:
      // await db.insert(suggestedCities).values({
      //   city,
      //   email,
      //   reason: reason || null,
      //   createdAt: new Date()
      // });

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

      let filteredUsers = city && city !== 'all'
        ? MOCK_USERS[city] || []
        : Object.values(MOCK_USERS).flat();

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

      filteredUsers.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

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
      const { location, creatorId } = req.query;

      // Build query for database
      let query = db.select().from(events);
      
      // Filter by location/city if provided
      if (location && location !== 'all') {
        query = query.where(
          // Try to match either location or city field
          or(
            eq(events.location, location as string),
            eq(events.city, location as string)
          )
        );
      }
      
      // Filter by creator if provided
      if (creatorId) {
        const parsedCreatorId = parseInt(creatorId as string);
        if (!isNaN(parsedCreatorId)) {
          query = query.where(eq(events.creatorId, parsedCreatorId));
        }
      }
      
      // Execute the query
      const dbEvents = await query.orderBy(asc(events.date));
      
      // Fetch creator information for each event
      const eventsWithCreators = await Promise.all(
        dbEvents.map(async (event) => {
          // Get creator info if available
          let creator = null;
          if (event.creatorId) {
            const creatorResult = await db.select({
              id: users.id,
              name: users.fullName,
              username: users.username,
              image: users.profileImage
            })
            .from(users)
            .where(eq(users.id, event.creatorId))
            .limit(1);
            
            if (creatorResult.length > 0) {
              creator = creatorResult[0];
            }
          }
          
          // Get attendance counts from event_participants table
          const attendingCount = await db.select({ count: count() })
            .from(eventParticipants)
            .where(
              and(
                eq(eventParticipants.eventId, event.id),
                eq(eventParticipants.status, 'attending')
              )
            );
            
          const interestedCount = await db.select({ count: count() })
            .from(eventParticipants)
            .where(
              and(
                eq(eventParticipants.eventId, event.id),
                eq(eventParticipants.status, 'interested')
              )
            );
          
          // For now use empty arrays for attending/interested users
          // In a future update, we would fetch these from event_participants table with user details
          return {
            ...event,
            creatorName: creator?.name || creator?.username || "Anonymous",
            creatorImage: creator?.image || null,
            attendingUsers: [],
            interestedUsers: [],
            attendingCount: attendingCount[0]?.count || 0,
            interestedCount: interestedCount[0]?.count || 0
          };
        })
      );
      
      // If no events found in the database, fall back to mock events for development
      // This will be removed once we have enough real events
      let eventResults = eventsWithCreators;
      if (eventResults.length === 0 && !creatorId) {
        let filteredEvents = location && location !== 'all'
          ? MOCK_EVENTS[location as string] || []
          : Object.values(MOCK_EVENTS).flat();
  
        filteredEvents.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        eventResults = filteredEvents;
      }

      res.json(eventResults);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);
      
      // Try to find the event in the database
      const dbEvent = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
      
      if (dbEvent.length > 0) {
        // Get creator info
        let creator = null;
        if (dbEvent[0].creatorId) {
          const creatorResult = await db.select({
            id: users.id,
            name: users.fullName,
            username: users.username,
            image: users.profileImage
          })
          .from(users)
          .where(eq(users.id, dbEvent[0].creatorId))
          .limit(1);
          
          if (creatorResult.length > 0) {
            creator = creatorResult[0];
          }
        }
        
        // Return the event with creator info
        return res.json({
          ...dbEvent[0],
          creatorName: creator?.name || creator?.username || "Anonymous",
          creatorImage: creator?.image || null,
          attendingUsers: [],
          interestedUsers: [],
          attendingCount: 0,
          interestedCount: 0
        });
      }
      
      // If not in database, check mock events (will be removed in production)
      const allEvents = Object.values(MOCK_EVENTS).flat();
      const event = allEvents.find(e => e.id === eventId);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", upload.single('image'), async (req, res) => {
    try {
      // Get authenticated user from session or form data
      const currentUser = req.user as any;
      let creatorId = currentUser?.id || null;
      
      // If no authenticated user, but creatorId in form, use that
      if (!currentUser && req.body.creatorId) {
        creatorId = parseInt(req.body.creatorId);
        
        // Verify the creatorId is valid
        if (!isNaN(creatorId)) {
          const userExists = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.id, creatorId))
            .limit(1);
            
          if (userExists.length === 0) {
            creatorId = null; // Reset if user doesn't exist
          }
        } else {
          creatorId = null;
        }
      }
      
      const imagePath = req.file ? `/uploads/${req.file.filename}` : getEventImage(req.body.category);
      
      // Parse date and other fields correctly
      const eventDate = req.body.date ? new Date(req.body.date) : new Date();
      const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
      const capacity = parseInt(req.body.capacity || '0');
      const price = req.body.price || '0';
      const ticketType = req.body.ticketType || (parseFloat(price) > 0 ? 'paid' : 'free');
      
      // Parse tags if provided
      let tags = [];
      if (req.body.tags) {
        try {
          if (typeof req.body.tags === 'string') {
            tags = JSON.parse(req.body.tags);
          } else {
            tags = req.body.tags;
          }
        } catch (e) {
          console.warn("Could not parse tags:", e);
        }
      }
      
      // Insert new event into database
      const newEvent = await db.insert(events).values({
        title: req.body.title,
        description: req.body.description,
        date: eventDate,
        endDate: endDate,
        location: req.body.location,
        city: req.body.city || req.body.location, // Default to location if city not specified
        category: req.body.category,
        image: imagePath,
        image_url: req.body.image_url || null,
        capacity: capacity,
        price: price,
        ticketType: ticketType,
        availableTickets: req.body.availableTickets || capacity,
        createdAt: new Date(),
        isPrivate: req.body.isPrivate === 'true' || req.body.isPrivate === true,
        isBusinessEvent: req.body.isBusinessEvent === 'true' || req.body.isBusinessEvent === true,
        tags: tags,
        attendingCount: 0,
        interestedCount: 0,
        timeFrame: req.body.timeFrame || null,
        stripeProductId: req.body.stripeProductId || null,
        stripePriceId: req.body.stripePriceId || null,
        creatorId: creatorId
      }).returning();
      
      // Get creator details to return with response
      let creatorName = "Anonymous";
      let creatorImage = null;
      
      if (creatorId) {
        const creator = await db.select({
          id: users.id,
          name: users.fullName,
          username: users.username,
          image: users.profileImage
        }).from(users).where(eq(users.id, creatorId)).limit(1);
        
        if (creator.length > 0) {
          creatorName = creator[0]?.name || creator[0]?.username || "Anonymous";
          creatorImage = creator[0]?.image || null;
        }
      }
      
      // Prepare response with additional fields
      const eventResponse = {
        ...newEvent[0],
        creatorName,
        creatorImage,
        attendingUsers: [],
        interestedUsers: [],
        attendingCount: 0,
        interestedCount: 0
      };

      console.log("Created new event:", eventResponse.title);
      res.status(201).json(eventResponse);
    } catch (error: any) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event", details: error.message });
    }
  });

  app.post("/api/events/:eventId/participate", async (req, res) => {
    try {
      const { eventId } = req.params;
      const { status } = req.body;
      const currentUser = req.user as any;
      
      if (!currentUser) {
        return res.status(401).json({ error: "Authentication required to participate in events" });
      }
      
      const parsedEventId = parseInt(eventId);
      
      // Check if the event exists
      const eventExists = await db.select({ id: events.id })
        .from(events)
        .where(eq(events.id, parsedEventId))
        .limit(1);
        
      if (eventExists.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Check if the user already has a participation record
      const existingParticipation = await db.select()
        .from(eventParticipants)
        .where(
          and(
            eq(eventParticipants.eventId, parsedEventId),
            eq(eventParticipants.userId, currentUser.id)
          )
        )
        .limit(1);
      
      let participation;
      
      if (existingParticipation.length > 0) {
        // Update existing participation
        participation = await db.update(eventParticipants)
          .set({
            status: status
          })
          .where(
            and(
              eq(eventParticipants.eventId, parsedEventId),
              eq(eventParticipants.userId, currentUser.id)
            )
          )
          .returning();
      } else {
        // Create new participation record
        participation = await db.insert(eventParticipants)
          .values({
            eventId: parsedEventId,
            userId: currentUser.id,
            status: status
          })
          .returning();
      }
      
      res.json(participation[0]);
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
  
  // Add authentication check endpoint
  app.get('/api/auth/check', checkAuthentication);
  
  return { app, httpServer };
}