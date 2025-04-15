import multer from 'multer';
import path from 'path';
import express, { Request, Response, Express, NextFunction } from 'express';
import { createServer, Server } from 'http';
import { setupAuth } from './auth';
import { handleChatMessage } from './chat';
import { findMatches } from './services/matchingService';
import { translateMessage } from './services/translationService';
import { getEventImage } from './services/eventsService';
import { WebSocketServer, WebSocket } from 'ws';
import { sendMessage, getConversations, getMessages, markMessageAsRead, markAllMessagesAsRead } from './services/messagingService';
import { db } from "../db";
import { userCities, users, events, sessions, userConnections, eventParticipants, payments, subscriptions } from "../db/schema";
import { eq, ne, gte, lte, and, or, desc } from "drizzle-orm";
import { stripe } from './lib/stripe'; // Import Stripe client from server/lib
import Stripe from 'stripe'; // Ensure Stripe type is available if needed later
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { isNotNull } from "drizzle-orm";
import { recordSubscriptionPayment, getUserPaymentHistory, getSubscriptionWithPayments, getPaymentStats } from "./lib/payments";
import { sql } from 'drizzle-orm';

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
        { id: 1050, name: "Amanda Brown", image: "/attached_assets/profile-image-41.jpg" }
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
// Import centralized authentication functions instead of duplicated local implementations
import { isAuthenticated, checkAuthentication } from './middleware/auth.middleware';

// Authentication middleware
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Method 1: Check if already authenticated via passport
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  
  // Method 2: Try to authenticate via session ID in headers or cookies
  const headerSessionId = req.headers['x-session-id'] as string;
  const cookieSessionId = req.cookies?.maly_session_id || req.cookies?.sessionId;
  
  if (headerSessionId || cookieSessionId) {
    const sessionId = headerSessionId || cookieSessionId;
    
    try {
      // Check for session in the database
      const sessionResults = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId));
      
      if (sessionResults.length > 0 && sessionResults[0].userId) {
        // Session is valid, find the user
        const userResults = await db
          .select()
          .from(users)
          .where(eq(users.id, sessionResults[0].userId));
        
        if (userResults.length > 0) {
          // Set the user on the request so it's available to route handlers
          req.user = userResults[0] as any;
          console.log(`User authenticated via session ID: ${userResults[0].username}`);
          return next();
        }
      }
    } catch (err: any) {
      console.error("Error authenticating via session:", err);
    }
  }
  
  // If we get here, authentication failed
  return res.status(401).json({ error: 'Authentication required' });
};

export function registerRoutes(app: Express): { app: Express; httpServer: Server } {
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
      const { location: city, gender, minAge: minAgeStr, maxAge: maxAgeStr } = req.query;
      const interests = req.query['interests[]'] as string[] | string;
      const moods = req.query['moods[]'] as string[] | string;
      const name = req.query.name as string;
      const currentUserIdSource = req.user?.id || req.query.currentUserId as string;
      const currentUserId = currentUserIdSource ? parseInt(currentUserIdSource.toString(), 10) : undefined;
      
      // Database query to get real users
      let query = db.select().from(users);

      // Always exclude the current user from results if available
      if (currentUserId && !isNaN(currentUserId)) {
        query = query.where(ne(users.id, currentUserId)); // Use the parsed ID
      }
      
      // Remove redundant/incorrect line: query = query.where(ne(users.id, currentUserId));

      // Apply filters to query
      if (city && city !== 'all') {
        query = query.where(eq(users.location, city as string));
      }

      if (gender && gender !== 'all') {
        query = query.where(eq(users.gender, gender as string));
      }
      
      const minAge = minAgeStr ? parseInt(minAgeStr as string, 10) : undefined;
      const maxAge = maxAgeStr ? parseInt(maxAgeStr as string, 10) : undefined;

      if (minAge !== undefined && !isNaN(minAge)) {
        query = query.where(gte(users.age, minAge));
      }

      if (maxAge !== undefined && !isNaN(maxAge)) {
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
      const currentUser = req.user;

      // If username is undefined/null and user is logged in, return current user
      if ((!username || username === 'undefined') && currentUser) {
        console.log("Returning current user profile:", currentUser.username);
        return res.json(currentUser);
      }

      // If username is provided, get from database
      const dbUser = await db.select()
        .from(users)
        .where(eq(users.username, username || ''))
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

      console.log(`Found ${dbEvents.length} events to display`);

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
      let message = "Failed to fetch events";
      if (error instanceof Error) {
          message = error.message;
      }
      res.status(500).json({ 
        error: message
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

        // If we have a creatorId, fetch the creator information
        if (event.creatorId) {
          try {
            // Get creator details
            const creatorQuery = await db.select({
              id: users.id,
              username: users.username,
              fullName: users.fullName,
              profileImage: users.profileImage
            })
            .from(users)
            .where(eq(users.id, event.creatorId))
            .limit(1);

            if (creatorQuery && creatorQuery.length > 0) {
              // Add creator details to the event object
              const creator = creatorQuery[0];
              const eventWithCreator = {
                ...event,
                creatorName: creator.fullName || creator.username,
                creatorImage: creator.profileImage,
                creatorUsername: creator.username
              };
              
              console.log(`Found event in database with creator: ${event.title}, creator: ${creator.username}`);
              return res.json(eventWithCreator);
            }
          } catch (creatorError) {
            console.error("Error fetching creator details:", creatorError);
            // Continue without creator details
          }
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
      let message = "Failed to fetch event";
      if (error instanceof Error) {
          message = error.message;
      }
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/events", upload.single('image'), async (req, res) => {
    try {
      // Use only user ID-based authentication methods (no session ID)
      let currentUser = null;

      // Method 1: Check if user is authenticated via passport (primary method)
      if (req.isAuthenticated() && req.user) {
        currentUser = req.user;
        console.log("User authenticated via passport for event creation:", currentUser.username);
      }
      
      // Method 2: Check X-User-ID header (secondary method)
      if (!currentUser) {
        const headerUserId = req.headers['x-user-id'] as string;
        
        if (headerUserId) {
          console.log("Trying to authenticate via User-ID header:", headerUserId);
          
          try {
            const userId = parseInt(headerUserId);
            const [user] = await db.select()
              .from(users)
              .where(eq(users.id, userId))
              .limit(1);
              
            if (user) {
              currentUser = user;
              console.log("User authenticated via User-ID header for event creation:", user.username);
            }
          } catch (err) {
            console.error("Error checking user by header ID:", err);
          }
        }
      }

      // Method 3: Allow using userId directly from body as a fallback
      if (!currentUser && req.body.userId) {
        const userId = parseInt(req.body.userId);
        console.log("Trying to authenticate via direct userId from body:", userId);

        try {
          const [user] = await db.select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          if (user) {
            currentUser = user;
            console.log("User authenticated via direct userId for event creation:", user.username);
          }
        } catch (err) {
          console.error("Error checking user by ID:", err);
        }
      }

      // If no authenticated user found through user ID methods, return error
      if (!currentUser) {
        console.error("Unable to authenticate user for event creation - no valid user ID found");
        return res.status(401).json({ error: "Authentication required to create events - valid user ID required" });
      }

      console.log("User authenticated for event creation:", currentUser.username);

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
        city: req.body.city || 'Unknown',
        category: req.body.category,
        ticketType: req.body.price && parseFloat(req.body.price) > 0 ? 'paid' : 'free',
        capacity: parseInt(req.body.capacity || '10'),
        price: req.body.price ? req.body.price.toString() : '0', // Ensure price is a string
        date: new Date(req.body.date || new Date()),
        tags: tags,
        image: req.file ? `/uploads/${req.file.filename}` : getEventImage(req.body.category || 'Social'),
        image_url: req.file ? `/uploads/${req.file.filename}` : getEventImage(req.body.category || 'Social'),
        creatorId: currentUser.id,
        isPrivate: req.body.isPrivate === 'true',
        createdAt: new Date(),
        isBusinessEvent: req.body.organizerType === 'business',
        timeFrame: req.body.timeFrame || '',
        stripeProductId: null,
        stripePriceId: null
      };

      console.log(`Creating new event:`, eventData.title);

      // Insert the event into the database
      const result = await db.insert(events).values(eventData).returning();

      if (result && result.length > 0) {
        console.log(`Event successfully saved to database with ID: ${result[0].id}`);
        return res.status(201).json({
          success: true,
          message: "Event published successfully",
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

  app.get("/api/events/:eventId/participation/status", async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "You must be logged in to view participation status" });
      }

      // Check if user has a participation record
      const participation = await db.select()
        .from(eventParticipants)
        .where(
          and(
            eq(eventParticipants.eventId, parseInt(eventId)),
            eq(eventParticipants.userId, userId)
          )
        )
        .limit(1);

      if (participation.length === 0) {
        return res.status(404).json({ status: 'not_attending' });
      }

      res.json({ status: participation[0].status });
    } catch (error) {
      console.error("Error fetching participation status:", error);
      res.status(500).json({ error: "Failed to fetch participation status" });
    }
  });

  app.post("/api/events/:eventId/participate", async (req, res) => {
    try {
      const { eventId } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "You must be logged in to participate in events" });
      }

      if (!['attending', 'interested', 'not_attending'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'attending', 'interested', or 'not_attending'" });
      }

      // Get the event
      const event = await db.select().from(events).where(eq(events.id, parseInt(eventId))).limit(1);

      if (!event.length) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user already has a participation record
      const existingParticipation = await db.select()
        .from(eventParticipants)
        .where(
          and(
            eq(eventParticipants.eventId, parseInt(eventId)),
            eq(eventParticipants.userId, userId)
          )
        )
        .limit(1);

      let result;

      if (existingParticipation.length > 0) {
        const oldStatus = existingParticipation[0].status;

        // Update the existing record
        if (status === 'not_attending') {
          // If changing to not attending, delete the record instead
          await db.delete(eventParticipants)
            .where(
              and(
                eq(eventParticipants.eventId, parseInt(eventId)),
                eq(eventParticipants.userId, userId)
              )
            );

          result = { status: 'not_attending', message: "Participation removed" };
        } else {
          // Update the status
          result = await db.update(eventParticipants)
            .set({ status })
            .where(
              and(
                eq(eventParticipants.eventId, parseInt(eventId)),
                eq(eventParticipants.userId, userId)
              )
            )
            .returning();
        }

        // Update count on the event
        if (oldStatus !== status) {
          // Decrement the old status count if it was 'attending' or 'interested'
          if (oldStatus === 'attending') {
            await db.update(events)
              .set({ attendingCount: event[0].attendingCount - 1 })
              .where(eq(events.id, parseInt(eventId)));
          } else if (oldStatus === 'interested') {
            await db.update(events)
              .set({ interestedCount: event[0].interestedCount - 1 })
              .where(eq(events.id, parseInt(eventId)));
          }

          // Increment the new status count if it's 'attending' or 'interested'
          if (status === 'attending') {
            await db.update(events)
              .set({ attendingCount: event[0].attendingCount + 1 })
              .where(eq(events.id, parseInt(eventId)));
          } else if (status === 'interested') {
            await db.update(events)
              .set({ interestedCount: event[0].interestedCount + 1 })
              .where(eq(events.id, parseInt(eventId)));
          }
        }
      } else if (status !== 'not_attending') {
        // Create a new participation record if the status is not 'not_attending'
        result = await db.insert(eventParticipants)
          .values({
            eventId: parseInt(eventId),
            userId,
            status,
            ticketQuantity: 1,
          })
          .returning();

        // Increment the appropriate count
        if (status === 'attending') {
          await db.update(events)
            .set({ attendingCount: event[0].attendingCount + 1 })
            .where(eq(events.id, parseInt(eventId)));
        } else if (status === 'interested') {
          await db.update(events)
            .set({ interestedCount: event[0].interestedCount + 1 })
            .where(eq(events.id, parseInt(eventId)));
        }
      } else {
        // If status is 'not_attending' and no record exists, nothing to do
        result = { status: 'not_attending', message: "User was not participating in this event" };
      }

      // Get the updated event
      const updatedEvent = await db.select().from(events).where(eq(events.id, parseInt(eventId))).limit(1);

      res.json({
        participation: result,
        event: updatedEvent[0]
      });
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

      // Return appropriate error status for connection-related errors
      if (error instanceof Error && error.message.includes('Users must be connected')) {
        return res.status(403).json({ error: error.message });
      }

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

      // Return appropriate error status for connection-related errors
      if (error instanceof Error && error.message.includes('No user connections found')) {
        return res.status(200).json([]); // Return empty array instead of error for no connections
      }

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

      // Return appropriate error status for connection-related errors
      if (error instanceof Error && error.message.includes('Users must be connected')) {
        return res.status(403).json({ error: error.message });
      }

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

  // Store active connections and their ping states
  const activeConnections = new Map<number, {
    ws: WebSocket;
    isAlive: boolean;
    pingTimeout?: NodeJS.Timeout;
  }>();

  // Ping interval (30 seconds)
  const PING_INTERVAL = 30000;
  const CONNECTION_TIMEOUT = 35000;

  function heartbeat(userId: number) {
    if (activeConnections.has(userId)) {
      const connection = activeConnections.get(userId)!;
      connection.isAlive = true;

      // Reset ping timeout
      if (connection.pingTimeout) {
        clearTimeout(connection.pingTimeout);
      }

      connection.pingTimeout = setTimeout(() => {
        console.log(`Connection timeout for user ${userId}`);
        connection.ws.terminate();
        activeConnections.delete(userId);
      }, CONNECTION_TIMEOUT);
    }
  }

  // Handle WebSocket connections
  wss.on('connection', (ws, req) => {
    // Extract user ID from URL path: /ws/chat/:userId
    const urlPath = req.url || '';
    const match = urlPath.match(/\/chat\/(\d+)/);

    if (!match) {
      console.log('Invalid WebSocket connection path:', urlPath);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid connection path. Expected format: /ws/chat/:userId'
      }));
      ws.close();
      return;
    }

    const userId = parseInt(match[1], 10);
    console.log(`WebSocket connection established for user ${userId}`);

    // Store the connection
    activeConnections.set(userId, { ws, isAlive: true });

    // Send a welcome message to confirm successful connection
    ws.send(JSON.stringify({
      type: 'connected',
      message: `Connected as user ${userId}`
    }));

    // Handle messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`WebSocket message received from user ${userId}:`, JSON.stringify(data));

        // Validate message structure
        if (!data.senderId || !data.receiverId || !data.content) {
          console.error('Invalid message format:', data);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format. Required fields: senderId, receiverId, content'
          }));
          return;
        }

        // Store the message in the database (this already checks for connection status)
        try {
          const newMessage = await sendMessage({
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content
          });

          console.log(`Message stored in database:`, JSON.stringify(newMessage[0]));

          // Send the message to the recipient if they're connected
          const recipientWs = activeConnections.get(data.receiverId);
          if (recipientWs && recipientWs.ws.readyState === WebSocket.OPEN) {
            console.log(`Sending message to recipient ${data.receiverId}`);
            recipientWs.ws.send(JSON.stringify(newMessage[0]));
          } else {
            console.log(`Recipient ${data.receiverId} not connected or socket not open`);
          }

          // Send confirmation back to sender
          console.log(`Sending confirmation to sender ${data.senderId}`);
          ws.send(JSON.stringify({
            type: 'confirmation',
            message: newMessage[0]
          }));
        } catch (error) {
          // If error is "Users must be connected", send a better error message
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
          ws.send(JSON.stringify({
            type: 'error',
            message: errorMessage
          }));
          console.error('Error sending message via WebSocket:', errorMessage);
          return;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'An error occurred'
        }));
      }
    });

    // Handle connection errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
    });

    // Send a ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping(); // Use ws.ping() instead of sending a custom ping message
        heartbeat(userId);
      } else {
        clearInterval(pingInterval);
      }
    }, PING_INTERVAL);

    // Handle disconnection
    ws.on('close', () => {
      console.log(`WebSocket connection closed for user ${userId}`);
      activeConnections.delete(userId);
      clearInterval(pingInterval);
    });

    // Handle pong
    ws.on('pong', () => {
      console.log(`Pong received from user ${userId}`);
      heartbeat(userId);
    });

    // Initial heartbeat
    heartbeat(userId);

  });

  // Add authentication check endpoint that specifically looks for the session ID from various sources
// Auth check endpoint is now defined in server/auth.ts to avoid duplicate routes

  // Add endpoint to get user by session ID
  app.get('/api/user-by-session', async (req: Request, res: Response) => {
    try {
      // First check if user is authenticated via passport
      if (req.isAuthenticated() && req.user) {
        console.log("User already authenticated via passport:", (req.user as any).username);
        
        // Sanitize user object to remove sensitive info (like password)
        const { password, ...userWithoutPassword } = req.user as any;
        
        return res.json({
          ...userWithoutPassword,
          authenticated: true
        });
      }
      
      // Try to get session ID from multiple sources
      const headerSessionId = req.headers['x-session-id'] as string;
      const cookieSessionId = req.cookies?.sessionId || req.cookies?.maly_session_id;
      const expressSessionId = req.sessionID;
      
      const sessionId = headerSessionId || cookieSessionId || expressSessionId;
      
      console.log("User by session request, checking session ID sources:", {
        'x-session-id': headerSessionId || 'not_present',
        'cookie.sessionId': req.cookies?.sessionId || 'not_present',
        'cookie.maly_session_id': req.cookies?.maly_session_id || 'not_present',
        'express.sessionID': expressSessionId || 'not_present',
        'final_session_id': sessionId || 'none_found'
      });

      if (!sessionId) {
        console.log("No session ID provided in user-by-session request");
        
        // Check if the request wants HTML (browser) vs API (JSON) response
        const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
        
        // For browser requests, redirect to login page
        if (acceptsHtml) {
          console.log("Redirecting unauthenticated user to login page from user-by-session");
          return res.redirect('/login');
        }
        
        // For API requests, return JSON
        return res.status(401).json({
          error: "No session ID provided",
          authenticated: false
        });
      }

      // Find the user ID in the session
      const sessionQuery = await db.select().from(sessions).where(eq(sessions.id, sessionId));

      if (sessionQuery.length === 0 || !sessionQuery[0].userId) {
        console.log("No user found in session:", sessionId);
        
        // Check if the request wants HTML (browser) vs API (JSON) response
        const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
        
        // For browser requests, redirect to login page
        if (acceptsHtml) {
          console.log("Redirecting user with invalid session to login page");
          return res.redirect('/login');
        }
        
        // For API requests, return JSON
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
        
        // Check if the request wants HTML (browser) vs API (JSON) response
        const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
        
        // For browser requests, redirect to login page
        if (acceptsHtml) {
          console.log("Redirecting user not found in database to login page");
          return res.redirect('/login');
        }
        
        // For API requests, return JSON
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
      
      // Check if the request wants HTML (browser) vs API (JSON) response
      const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
      
      // For browser requests, redirect to login page
      if (acceptsHtml) {
        console.log("Redirecting user to login page due to server error");
        return res.redirect('/login');
      }
      
      // For API requests, return JSON
      return res.status(500).json({
        error: "Server error",
        authenticated: false
      });
    }
  });

  // Get user profile by ID
  app.get('/api/users/profile/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // Find the user by ID
      const user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(userId)),
        columns: {
          id: true,
          username: true,
          fullName: true,
          profileImage: true,
          bio: true,
          location: true,
          interests: true,
          currentMoods: true,
          profession: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });
  
  // Get user by ID - simplified endpoint for event creator info
  app.get('/api/users/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      console.log(`Fetching user with ID: ${userId}`);
      
      // Check if userId is a number
      if (isNaN(parseInt(userId))) {
        // This might be a username lookup, forward to the username handler
        return res.redirect(`/api/users/username/${userId}`);
      }
      
      // Find the user by ID
      const userQuery = await db.select().from(users).where(eq(users.id, parseInt(userId)));
      
      if (userQuery.length === 0) {
        console.log(`User not found with ID: ${userId}`);
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove sensitive information before returning user
      const { password, ...userWithoutPassword } = userQuery[0] as any;
      
      console.log(`Found user by ID: ${userWithoutPassword.username}`);
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });
  
  // Get user by username
  app.get('/api/users/username/:username', async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      console.log(`Fetching user with username: ${username}`);
      
      // Find the user by username
      const userQuery = await db.select().from(users).where(eq(users.username, username));
      
      if (userQuery.length === 0) {
        console.log(`User not found with username: ${username}`);
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove sensitive information before returning user
      const { password, ...userWithoutPassword } = userQuery[0] as any;
      
      console.log(`Found user by username: ${userWithoutPassword.username}`);
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user by username:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Connection related endpoints

  // Send a connection request
  app.post('/api/connections/request', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User;

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
  app.get('/api/connections/pending', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User;

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
      const formattedRequests = pendingRequests.map(request => {
        if (!request.follower) {
          console.error('Missing follower data in connection request:', request);
          return null;
        }

        return {
          id: request.follower.id,
          username: request.follower.username,
          fullName: request.follower.fullName,
          profileImage: request.follower.profileImage,
          requestDate: request.createdAt,
          status: request.status
        };
      }).filter(Boolean) as Array<{
        id: number;
        username: string;
        fullName: string | null;
        profileImage: string | null;
        requestDate: Date | null;
        status: string;
      }>;

      res.json(formattedRequests);
    } catch (error) {
      console.error('Error fetching pending connection requests:', error);
      res.status(500).json({ error: 'Failed to fetch pending connection requests' });
    }
  });

  // Accept or decline a connection request
  app.put('/api/connections/:userId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User;

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
  app.get('/api/connections', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User;

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

        if (!otherUser) {
          console.error('Missing related user data in connection:', connection);
          return null;
        }

        return {
          id: otherUser.id,
          username: otherUser.username,
          fullName: otherUser.fullName,
          profileImage: otherUser.profileImage,
          connectionDate: connection.createdAt,
          connectionType: isFollower ? 'following' : 'follower'
        };
      }).filter(Boolean) as Array<{
        id: number;
        username: string;
        fullName: string | null;
        profileImage: string | null;
        connectionDate: Date | null;
        connectionType: string;
      }>;

      res.json(formattedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      res.status(500).json({ error: 'Failed to fetch connections' });
    }
  });

  // Check connection status between current user and another user
  app.get('/api/connections/status/:userId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User;

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

  // Check connection status between current user and another user
  app.get('/api/connections/status/:userId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as Express.User;

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
// Event participation API endpoints

// Get a user's participation status for an event
app.get('/api/events/:eventId/participation/status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as Express.User;
    const { eventId } = req.params;

    // Find current participation status for this user and event
    const participationRecord = await db.query.eventParticipants.findFirst({
      where: and(
        eq(eventParticipants.userId, currentUser.id),
        eq(eventParticipants.eventId, parseInt(eventId))
      )
    });

    if (!participationRecord) {
      return res.json({ status: 'not_participating' });
    }

    return res.json({ status: participationRecord.status });
  } catch (error) {
    console.error('Error getting participation status:', error);
    res.status(500).json({ error: 'Failed to get participation status' });
  }
});

// Update a user's participation status for an event
app.post('/api/events/:eventId/participate', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as Express.User;
    const { eventId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['interested', 'attending', 'not_participating'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be "interested", "attending", or "not_participating".' });
    }

    // Find the event to make sure it exists
    const event = await db.query.events.findFirst({
      where: eq(events.id, parseInt(eventId))
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Find current participation record if any
    const existingRecord = await db.query.eventParticipants.findFirst({
      where: and(
        eq(eventParticipants.userId, currentUser.id),
        eq(eventParticipants.eventId, parseInt(eventId))
      )
    });

    // Handle removal of participation (not_participating)
    if (status === 'not_participating') {
      if (existingRecord) {
        // Decrement appropriate counter based on previous status
        if (existingRecord.status === 'interested') {
          await db.update(events)
            .set({ interestedCount: Math.max((event.interestedCount || 0) - 1, 0) })
            .where(eq(events.id, parseInt(eventId)));
        } else if (existingRecord.status === 'attending') {
          await db.update(events)
            .set({ attendingCount: Math.max((event.attendingCount || 0) - 1, 0) })
            .where(eq(events.id, parseInt(eventId)));
        }

        // Delete the record
        await db.delete(eventParticipants)
          .where(and(
            eq(eventParticipants.userId, currentUser.id),
            eq(eventParticipants.eventId, parseInt(eventId))
          ));

        return res.json({ status: 'not_participating' });
      } else {
        // No record to delete
        return res.json({ status: 'not_participating' });
      }
    }

    // Handle adding or updating participation status
    if (existingRecord) {
      // Update existing record if status changed
      if (existingRecord.status !== status) {
        // First decrement the counter for the old status
        if (existingRecord.status === 'interested') {
          await db.update(events)
            .set({ interestedCount: Math.max((event.interestedCount || 0) - 1, 0) })
            .where(eq(events.id, parseInt(eventId)));
        } else if (existingRecord.status === 'attending') {
          await db.update(events)
            .set({ attendingCount: Math.max((event.attendingCount || 0) - 1, 0) })
            .where(eq(events.id, parseInt(eventId)));
        }

        // Increment counter for the new status
        if (status === 'interested') {
          await db.update(events)
            .set({ interestedCount: (event.interestedCount || 0) + 1 })
            .where(eq(events.id, parseInt(eventId)));
        } else if (status === 'attending') {
          await db.update(events)
            .set({ attendingCount: (event.attendingCount || 0) + 1 })
            .where(eq(events.id, parseInt(eventId)));
        }

        // Update the record
        await db.update(eventParticipants)
          .set({ 
            status,
            // Use the column directly instead of a property name
            [eventParticipants.updatedAt.name]: new Date()
          })
          .where(and(
            eq(eventParticipants.userId, currentUser.id),
            eq(eventParticipants.eventId, parseInt(eventId))
          ));
      }
    } else {
      // Create new record with proper field names from the schema
      await db.insert(eventParticipants).values({
        [eventParticipants.userId.name]: currentUser.id,
        [eventParticipants.eventId.name]: parseInt(eventId),
        [eventParticipants.status.name]: status,
        [eventParticipants.createdAt.name]: new Date()
      });

      // Increment the counter for the new status
      if (status === 'interested') {
        await db.update(events)
          .set({ interestedCount: (event.interestedCount || 0) + 1 })
          .where(eq(events.id, parseInt(eventId)));
      } else if (status === 'attending') {
        await db.update(events)
          .set({ attendingCount: (event.attendingCount || 0) + 1 })
          .where(eq(events.id, parseInt(eventId)));
      }
    }

    return res.json({ status });
  } catch (error) {
    console.error('Error updating participation status:', error);
    res.status(500).json({ error: 'Failed to update participation status' });
  }
});

  // Stripe requires the raw body to construct the event
  // IMPORTANT: This must come *before* express.json() middleware, or apply only to this route.
  // We'll apply it specifically to the webhook route.
  app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured.');
      return res.sendStatus(400);
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) { // Keep simple catch, handle error below
      console.error(`Error verifying webhook signature:`);
      if (err instanceof Error) {
        console.error(err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      return res.status(400).send(`Webhook Error: Unknown error`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        // --- Retrieve and validate metadata --- 
        const userIdStr = session.metadata?.userId;
        const eventIdStr = session.metadata?.eventId;
        const quantityStr = session.metadata?.quantity;
        
        const userId = userIdStr ? parseInt(userIdStr, 10) : NaN;
        const eventId = eventIdStr ? parseInt(eventIdStr, 10) : NaN;
        const quantity = quantityStr ? parseInt(quantityStr, 10) : 1; // Default quantity to 1 if missing/invalid

        if (isNaN(userId) || isNaN(eventId) || isNaN(quantity)) {
            console.error('Missing or invalid metadata in checkout session:', session.id, { userIdStr, eventIdStr, quantityStr });
            return res.status(400).send('Metadata error.');
        }

        // --- Payment details --- 
        const stripeCheckoutSessionId = session.id;
        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
        const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const amount = session.amount_total;
        const currency = session.currency;

        if (!paymentIntentId || amount === null || !currency) {
             console.error('Missing payment details in checkout session:', session.id);
             return res.status(400).send('Payment detail error.');
        }

        try {
            // --- Generate Unique Ticket Identifier --- 
            const ticketIdentifier = uuidv4();
            
            // --- Update Event Participant --- 
            const [participant] = await db
                .update(eventParticipants)
                .set({
                    paymentStatus: 'completed',
                    paymentIntentId: paymentIntentId, 
                    purchaseDate: new Date(),
                    ticketIdentifier: ticketIdentifier, // Store the unique identifier
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(eventParticipants.userId, userId), // Use validated number userId
                    eq(eventParticipants.eventId, eventId), // Use validated number eventId
                    eq(eventParticipants.paymentIntentId, stripeCheckoutSessionId) // Look for session ID in paymentIntentId field
                ))
                .returning();
            
            if (!participant) {
                console.error(`Webhook: Event participant not found for session: ${stripeCheckoutSessionId}, userId: ${userId}, eventId: ${eventId}`);
                 return res.status(404).send('Participant not found.');
            }

            // --- Create Payment Record --- 
             await db.insert(payments).values({
                userId: userId,
                eventParticipantId: participant.id, 
                stripeChargeId: paymentIntentId, 
                // We don't have a stripeCheckoutSessionId column in the database,
                // so use the paymentIntentId (which contains the session ID) twice
                stripeCheckoutSessionId: paymentIntentId, 
                stripeCustomerId: stripeCustomerId,
                amount: amount,
                currency: currency,
                status: 'succeeded',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // --- Update Event Ticket Count --- 
             const [eventData] = await db.select({ availableTickets: events.availableTickets }).from(events).where(eq(events.id, eventId));
             if (eventData && typeof eventData.availableTickets === 'number') {
                 await db.update(events)
                    .set({ availableTickets: eventData.availableTickets - quantity })
                    .where(eq(events.id, eventId));
             }
             console.log(`Successfully processed checkout for session: ${stripeCheckoutSessionId}, Ticket ID: ${ticketIdentifier}`);

        } catch (dbError) { // Keep simple catch, handle error below
            console.error(`Database error processing webhook for session ${stripeCheckoutSessionId}:`);
             if (dbError instanceof Error) {
                console.error(dbError.message);
             }
            return res.sendStatus(500);
        }

        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  });

  // Ensure regular JSON parsing happens *after* the raw body parser for the webhook
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Define other routes *after* middleware setup
  // ... existing routes ...

  // --- Create Stripe Checkout Session Endpoint --- 
  app.post('/api/payments/create-checkout-session', async (req: Request, res: Response) => {
    // Check authentication - try multiple methods
    let userId: number | null = null;
    
    // Method 1: Check if authenticated via passport
    if (req.isAuthenticated() && req.user) {
      userId = (req.user as any).id;
      console.log("User authenticated via passport:", (req.user as any).username);
    } 
    // Method 2: Try to get userId from request headers and body
    else {
      const headerUserId = req.headers['x-user-id'] as string;
      const headerSessionId = req.headers['x-session-id'] as string;
      const cookieSessionId = req.cookies?.maly_session_id || req.cookies?.sessionId;
      const bodyUserId = req.body.userId;
      
      console.log("Checkout authentication attempt via alternative methods:", {
        headerUserId: headerUserId || 'not_present',
        headerSessionId: headerSessionId || 'not_present',
        cookieSessionId: cookieSessionId || 'not_present',
        bodyUserId: bodyUserId || 'not_present'
      });
      
      // Try to authenticate using the session if available
      if (headerSessionId || cookieSessionId) {
        const sessionId = headerSessionId || cookieSessionId;
        try {
          const sessionQuery = await db
            .select()
            .from(sessions)
            .where(eq(sessions.id, sessionId));
            
          if (sessionQuery.length > 0 && sessionQuery[0].userId) {
            userId = sessionQuery[0].userId;
            console.log("User authenticated via sessionId:", sessionId);
          }
        } catch (error) {
          console.error("Error checking session:", error);
        }
      }
      
      // If still not authenticated, use X-User-ID header or body userId as a fallback
      if (!userId) {
        if (headerUserId) {
          userId = parseInt(headerUserId, 10);
          console.log("User ID from header:", userId);
        } else if (bodyUserId) {
          userId = parseInt(bodyUserId.toString(), 10);
          console.log("User ID from request body:", userId);
        }
        
        // Verify this user exists if we found an ID
        if (userId) {
          try {
            const userQuery = await db
              .select()
              .from(users)
              .where(eq(users.id, userId));
              
            if (!userQuery.length) {
              console.log("User not found for ID:", userId);
              userId = null;
            } else {
              console.log("User verified from ID:", userQuery[0].username);
            }
          } catch (err) {
            console.error("Error verifying user:", err);
            userId = null;
          }
        }
      }
    }
    
    // If no user ID found through any method, return authentication error
    if (!userId) {
      console.log("Checkout failed: No authenticated user found");
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { eventId: eventIdReq, quantity: quantityReq = 1 } = req.body;

    if (!eventIdReq) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
      const eventId = parseInt(eventIdReq.toString(), 10);
      const quantity = parseInt(quantityReq.toString(), 10);

      // Fetch event details
      const event = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event || !event.length) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Convert string price to cents for Stripe
      const unitAmount = parseInt((parseFloat(event[0].price || '0') * 100).toString(), 10);

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: event[0].title,
                description: event[0].description,
                // Only include images if they have a valid URL
                ...(event[0].image && event[0].image.startsWith('http') ? {
                  images: [event[0].image]
                } : {}),
              },
              unit_amount: unitAmount,
            },
            quantity,
          },
        ],
        mode: 'payment',
        // Use absolute URLs for Stripe redirects
        success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/payment-cancel?eventId=${eventId}`, // Added the missing slash
        metadata: {
          eventId: eventId.toString(),
          userId: userId.toString(),
          quantity: quantity.toString(),
        },
      });

      // Create initial participation record
      await db.insert(eventParticipants).values({
        userId,
        eventId,
        status: 'pending',
        ticketQuantity: quantity,
        paymentStatus: 'initiated',
        paymentIntentId: session.id, // Use paymentIntentId to store the session ID since stripeCheckoutSessionId doesn't exist
        createdAt: new Date(),
      });

      return res.json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return res.status(500).json({ 
        error: 'Failed to create checkout session', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ... other routes ...

  // --- QR Code Download Endpoint --- 
  app.get('/api/tickets/:participantId/qr', requireAuth, async (req: Request, res: Response) => {
    const participantId = parseInt(req.params.participantId, 10);
    const userId = (req.user as any)?.id;

    if (isNaN(participantId) || !userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    try {
      // Fetch participant record and verify ownership
      const [participant] = await db
        .select({ 
            ticketIdentifier: eventParticipants.ticketIdentifier,
            userId: eventParticipants.userId,
            eventId: eventParticipants.eventId // For filename
         })
        .from(eventParticipants)
        .where(and(
          eq(eventParticipants.id, participantId),
          eq(eventParticipants.userId, userId) // Ensure the logged-in user owns this ticket
        ))
        .limit(1);

      if (!participant || !participant.ticketIdentifier) {
        return res.status(404).json({ error: 'Ticket not found or QR not available' });
      }

      // Generate QR Code
      const qrCodeDataURL = await QRCode.toDataURL(participant.ticketIdentifier, {
         errorCorrectionLevel: 'H', // High error correction
         type: 'image/png',
         margin: 1, // Minimal margin
         scale: 8 // Size of the QR code
      });

      // Convert data URL to buffer
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, "");
      const imgBuffer = Buffer.from(base64Data, 'base64');

      // Set headers for download
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="ticket-qr-${participant.eventId}-${participantId}.png"`);
      res.send(imgBuffer);

    } catch (error) {
      console.error(`Error generating QR code for participant ${participantId}:`, error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  });
  
  // --- Get Latest Ticket Endpoint --- 
  app.get('/api/me/latest-ticket', requireAuth, async (req: Request, res: Response) => {
     const userId = (req.user as any)?.id;
     
     if (!userId || isNaN(userId)) {
       return res.status(401).json({ error: 'User not authenticated' });
     }
     
     try {
         const [latestParticipant] = await db
            .select({ 
                id: eventParticipants.id,
                eventId: eventParticipants.eventId,
                purchaseDate: eventParticipants.purchaseDate
             })
            .from(eventParticipants)
            .where(and(
                eq(eventParticipants.userId, userId),
                eq(eventParticipants.paymentStatus, 'completed'), // Only completed purchases
                isNotNull(eventParticipants.ticketIdentifier) // Ensure QR is available
            ))
            .orderBy(desc(eventParticipants.purchaseDate)) // Get the most recent
            .limit(1);
            
        if (!latestParticipant) {
            return res.status(404).json({ message: 'No recent completed tickets found.' });
        }
        
        res.json(latestParticipant);
        
     } catch (error) {
         console.error(`Error fetching latest ticket for user ${userId}:`, error);
         res.status(500).json({ error: 'Failed to fetch latest ticket' });
     }
  });

  // --- Premium Subscription Routes ---

  // Create a checkout session for premium subscription
  app.post('/api/premium/create-checkout', async (req, res, next) => {
    // Use the checkAuthentication middleware as a function
    // This will either call next() if authenticated or return an error response
    await checkAuthentication(req, res, async () => {
      try {
        // Detailed session ID debugging
        const headerSessionId = req.headers['x-session-id'] as string;
        const cookieSessionId = req.cookies?.sessionId || req.cookies?.maly_session_id;
        const expressSessionId = req.sessionID;
        
        console.log("Premium checkout - session ID sources:", {
          'x-session-id': headerSessionId || 'not_present',
          'cookie.sessionId': req.cookies?.sessionId || 'not_present',
          'cookie.maly_session_id': req.cookies?.maly_session_id || 'not_present',
          'express.sessionID': expressSessionId || 'not_present',
          'passport_authenticated': req.isAuthenticated() ? 'yes' : 'no'
        });
        
        // At this point, the user should be authenticated and available on req.user
        // thanks to the checkAuthentication middleware
        const userId = req.user?.id;
        
        if (!userId) {
          console.log("Premium checkout - Authentication failed: No userId found after middleware");
          return res.status(401).json({ error: 'User not authenticated' });
        }

        console.log("Premium checkout - Proceeding with userId:", userId);

        // Get the subscription type (monthly, yearly, etc.)
        const { subscriptionType = 'monthly' } = req.body;
        
        // Calculate unit amount based on subscription type (in cents)
        // Use the same prices shown in the PremiumPage component
        const unitAmount = subscriptionType === 'yearly' ? 29000 : 2900; // $290 yearly or $29 monthly
        const interval = subscriptionType === 'yearly' ? 'year' : 'month';
        
        console.log(`Premium checkout - Creating checkout with ${subscriptionType} subscription at ${unitAmount/100} USD`);

        // Get user for customer information
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId)
        });

        if (!user) {
          console.log("Premium checkout - User not found in database for ID:", userId);
          return res.status(404).json({ error: 'User not found' });
        }

        console.log("Premium checkout - Creating Stripe session for user:", user.username);

        // Create a Stripe checkout session for subscription
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Maly Premium ${subscriptionType === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`,
                  description: `Unlock all premium features with our ${subscriptionType} subscription`,
                },
                unit_amount: unitAmount,
                recurring: {
                  interval: interval,
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${req.headers.origin}/premium-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/premium`,
          customer_email: user.email,
          client_reference_id: userId.toString(),
          metadata: {
            userId: userId.toString(),
            subscriptionType
          }
        });

        console.log("Premium checkout - Created Stripe session:", session.id);
        
        // Set the session ID in the response header so the client can store it
        res.setHeader('x-session-id', headerSessionId || cookieSessionId || expressSessionId || '');
        
        return res.json({ sessionId: session.id, url: session.url });
      } catch (error) {
        console.error('Error creating premium checkout session:', error);
        return res.status(500).json({ error: 'Failed to create checkout session' });
      }
    });
  });

  // Get subscription status
  app.get('/api/premium/status', checkAuthentication, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user is premium in the users table
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get active subscription if exists
      const subscription = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      });

      return res.json({
        isPremium: user.isPremium,
        subscription: subscription || null,
        expiresAt: subscription ? subscription.currentPeriodEnd : null
      });
    } catch (error) {
      console.error('Error getting premium status:', error);
      return res.status(500).json({ error: 'Failed to get premium status' });
    }
  });

  // Cancel subscription
  app.post('/api/premium/cancel', checkAuthentication, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get active subscription
      const subscription = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      });

      if (!subscription || !subscription.stripeSubscriptionId) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Cancel at period end to allow user to keep benefits until the end of the current period
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      // Update the subscription in our database
      await db.update(subscriptions)
        .set({
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(subscriptions.id, subscription.id));

      return res.json({ success: true, message: 'Subscription will be canceled at the end of the current billing period' });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  // Handle subscription webhook events
  app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured.');
      return res.status(500).send('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed:`, err);
      return res.status(400).send('Webhook signature verification failed');
    }

    try {
      // Handle the specific events
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          
          // Handle both subscription and one-time payments
          if (session.mode === 'subscription') {
            await handleSubscriptionCheckout(session);
          } else if (session.mode === 'payment') {
            await handlePaymentCheckout(session);
          }
          break;
        }
          
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePayment(invoice);
          break;
        }
          
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdated(subscription);
          break;
        }
          
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(subscription);
          break;
        }
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return res.json({ received: true });
    } catch (error) {
      console.error(`Error processing webhook: ${event.type}`, error);
      return res.status(500).send('Webhook processing failed');
    }
  });

  // Helper functions for webhook handling
  async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
    // Get metadata from the session
    const userId = parseInt(session.metadata?.userId || '0');
    const subscriptionType = session.metadata?.subscriptionType || 'monthly';
    
    if (!userId) {
      console.error('No user ID in session metadata');
      return;
    }
    
    // Get the subscription from Stripe
    if (!session.subscription) {
      console.error('No subscription created with checkout session');
      return;
    }
    
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription.id;
      
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    let dbSubscriptionId: number; // Store the DB subscription ID for payment recording
    
    // Insert subscription into database
    try {
      // Update user to premium
      await db.update(users)
        .set({ isPremium: true })
        .where(eq(users.id, userId));
        
      // Check if the subscription already exists
      const existingSubscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, subscriptionId)
      });
      
      if (existingSubscription) {
        // Update existing subscription
        await db.update(subscriptions)
          .set({
            status: stripeSubscription.status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            updatedAt: new Date()
          })
          .where(eq(subscriptions.id, existingSubscription.id));
      
        dbSubscriptionId = existingSubscription.id;
      } else {
        // Create new subscription
        const [newSubscription] = await db.insert(subscriptions).values({
          userId,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: typeof stripeSubscription.customer === 'string' 
            ? stripeSubscription.customer 
            : stripeSubscription.customer?.id,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          subscriptionType,
          priceId: stripeSubscription.items.data[0]?.price.id
        }).returning();
        
        dbSubscriptionId = newSubscription.id;
      }
      
      // Record the initial payment
      // Get the latest invoice for this subscription
      const invoices = await stripe.invoices.list({
        subscription: subscriptionId,
        limit: 1
      });
      
      if (invoices.data.length > 0) {
        const invoice = invoices.data[0];
        
        // Get payment intent if available
        let paymentIntent = null;
        if (invoice.payment_intent) {
          const paymentIntentId = typeof invoice.payment_intent === 'string'
            ? invoice.payment_intent
            : invoice.payment_intent.id;
          
          paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        }
        
        // Record the payment
        await recordSubscriptionPayment(
          dbSubscriptionId,
          userId,
          invoice,
          paymentIntent
        );
        
        console.log(`Initial payment recorded for subscription ${subscriptionId}, amount: ${invoice.amount_paid/100} ${invoice.currency}`);
      }
      
      console.log(`Successfully processed premium subscription for user ${userId}`);
    } catch (error) {
      console.error('Error storing subscription:', error);
      throw error;
    }
  }

  async function handlePaymentCheckout(session: Stripe.Checkout.Session) {
    // Handle one-time payment (existing code for event tickets)
    // **FIX**: Get userId from metadata, not client_reference_id
    const userId = parseInt(session.metadata?.userId || '0'); 
    const eventId = parseInt(session.metadata?.eventId || '0');
    const quantity = parseInt(session.metadata?.quantity || '1');
    const stripeCheckoutSessionId = session.id; // Get the actual session ID
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id; // Get the actual PI id

    console.log(`[Webhook] Received checkout.session.completed for session: ${stripeCheckoutSessionId}`);

    if (!userId || !eventId) {
      console.error(`[Webhook Error] Missing userId (${userId}) or eventId (${eventId}) in metadata for session: ${stripeCheckoutSessionId}`);
      return; // Stop processing
    }

    if (!paymentIntentId) {
        console.error(`[Webhook Error] Missing payment_intent ID in session: ${stripeCheckoutSessionId}`);
        // It's unusual but might happen in some edge cases. Decide if you want to stop or proceed.
        // For now, we'll log and potentially stop.
        return; 
    }

    console.log(`[Webhook] Processing payment checkout for user ${userId}, event ${eventId}, session ${stripeCheckoutSessionId}, PI: ${paymentIntentId}`);
    
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    
    try {
      console.log(`[Webhook] Searching for participant record for session ${stripeCheckoutSessionId} (user: ${userId}, event: ${eventId})`);
      // Find the initial participation record created when checkout started
      // Use the checkout session ID (stored in paymentIntentId column initially) to find the correct record
      const participantRecord = await db.query.eventParticipants.findFirst({
        where: and(
          eq(eventParticipants.userId, userId),
          eq(eventParticipants.eventId, eventId),
          // IMPORTANT: We stored the session.id in paymentIntentId when creating the participant record initially
          eq(eventParticipants.paymentIntentId, stripeCheckoutSessionId) 
        )
      });

      if (!participantRecord) {
        // This is a critical error. The webhook received a completed payment, but we can't find the matching 'pending' record
        // that should have been created when the user clicked "purchase".
        console.error(`[Webhook Critical Error] Could not find initial 'pending' participation record for session ${stripeCheckoutSessionId} (user: ${userId}, event: ${eventId}). Did the initial record creation fail?`);
        // You might want to add alerting here. For now, we stop processing.
        return; 
      }
      
      console.log(`[Webhook] Found participant record ID: ${participantRecord.id}. Current status: ${participantRecord.paymentStatus}`);
      
      // Check if already processed (idempotency check)
      if (participantRecord.paymentStatus === 'completed' && participantRecord.ticketIdentifier) {
          console.log(`[Webhook Info] Participation record ${participantRecord.id} already marked as completed. Skipping update. (Session: ${stripeCheckoutSessionId})`);
          return;
      }

      // Generate a unique ticket identifier
      const ticketIdentifier = uuidv4();
      console.log(`[Webhook] Generated new ticketIdentifier: ${ticketIdentifier} for participant ID: ${participantRecord.id}`);

      // Update the event participant record
      console.log(`[Webhook] Updating participant record ID: ${participantRecord.id} to status 'completed' and setting paymentIntentId to ${paymentIntentId}`);
      const updateResult = await db.update(eventParticipants)
        .set({
          paymentStatus: 'completed',
          paymentIntentId: paymentIntentId, // Update with the actual Payment Intent ID
          ticketIdentifier: ticketIdentifier,
          purchaseDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(eventParticipants.id, participantRecord.id)) // Update by the specific participant record ID
        .returning(); // Return the updated record to confirm

      if (!updateResult || updateResult.length === 0) {
          console.error(`[Webhook Error] Failed to update participant record ID: ${participantRecord.id}. Update returned no rows.`);
          // Consider adding specific error handling or retry logic here
          return;
      }

      console.log(`[Webhook] Successfully updated event participation for user ${userId}, event ${eventId}, participant ID: ${participantRecord.id}, ticket ID: ${ticketIdentifier}`);

      // Optionally, create a record in the main payments table
      if (session.amount_total && session.currency) {
        console.log(`[Webhook] Creating payment record for session ${stripeCheckoutSessionId}`);
        await db.insert(payments).values({
          userId: userId,
          eventParticipantId: participantRecord.id, // Link to the participant record
          stripeCheckoutSessionId: stripeCheckoutSessionId, // Use the actual session ID
          stripeChargeId: paymentIntentId, // Use the actual Payment Intent ID
          stripeCustomerId: stripeCustomerId,
          amount: session.amount_total, // Amount in cents
          currency: session.currency,
          status: 'succeeded',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`[Webhook] Successfully created payment record for session ${stripeCheckoutSessionId}`);
      } else {
           console.warn(`[Webhook Warning] Missing amount_total or currency for session ${stripeCheckoutSessionId}. Skipping payment record creation.`);
      }
      
    } catch (error) {
      console.error(`[Webhook Error] Database error processing checkout session ${stripeCheckoutSessionId}:`, error);
      // Re-throw the error so the main webhook handler catches it and returns 500
      // This ensures Stripe knows the webhook failed and will retry.
      throw error; 
    }
  }

  async function handleInvoicePayment(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;
    
    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription.id;
    
    // Get the subscription from our database
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, subscriptionId)
    });
    
    if (!subscription) {
      console.error(`Subscription not found for invoice: ${invoice.id}`);
      return;
    }
    
    // Get the updated subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update our subscription record
    await db.update(subscriptions)
      .set({
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscription.id));
    
    // Make sure the user is marked as premium
    await db.update(users)
      .set({ isPremium: true })
      .where(eq(users.id, subscription.userId));
    
    // Get payment intent if available
    let paymentIntent = null;
    if (invoice.payment_intent) {
      const paymentIntentId = typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent.id;
      
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    }
    
    // Record the payment in our database
    try {
      await recordSubscriptionPayment(
        subscription.id,
        subscription.userId,
        invoice,
        paymentIntent
      );
      console.log(`Payment recorded for invoice ${invoice.id}`);
    } catch (error) {
      console.error(`Error recording payment for invoice ${invoice.id}:`, error);
    }
    
    console.log(`Updated subscription for user ${subscription.userId} after invoice payment`);
  }

  async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // Find the subscription in our database
    const dbSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, subscription.id)
    });
    
    if (!dbSubscription) {
      console.error(`Subscription not found for update: ${subscription.id}`);
      return;
    }
    
    // Update the subscription in our database
    await db.update(subscriptions)
      .set({
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, dbSubscription.id));
    
    // If the subscription is no longer active, remove premium status
    if (subscription.status !== 'active') {
      await db.update(users)
        .set({ isPremium: false })
        .where(eq(users.id, dbSubscription.userId));
    }
    
    console.log(`Updated subscription status to ${subscription.status} for user ${dbSubscription.userId}`);
  }

  async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Find the subscription in our database
    const dbSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, subscription.id)
    });
    
    if (!dbSubscription) {
      console.error(`Subscription not found for deletion: ${subscription.id}`);
      return;
    }
    
    // Update the subscription in our database
    await db.update(subscriptions)
      .set({
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, dbSubscription.id));
    
    // Remove premium status from the user
    await db.update(users)
      .set({ isPremium: false })
      .where(eq(users.id, dbSubscription.userId));
    
    console.log(`Marked subscription as canceled for user ${dbSubscription.userId}`);
  }

  // Get user's payment history
  app.get('/api/me/payment-history', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      // Get payment history
      const payments = await getUserPaymentHistory(userId);
      
      return res.json({ payments });
    } catch (error) {
      console.error('Error getting payment history:', error);
      return res.status(500).json({ error: 'Failed to get payment history' });
    }
  });
  
  // Get details for a specific subscription including payment history
  app.get('/api/me/subscriptions/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const subscriptionId = parseInt(req.params.id, 10);
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      if (isNaN(subscriptionId)) {
        return res.status(400).json({ error: 'Invalid subscription ID' });
      }
      
      // Get subscription
      const subscription = await db.query.subscriptions.findFirst({
        where: (subscriptions, { and, eq }) => and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.userId, userId)
        )
      });
      
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      
      // Get subscription with payment history
      const subscriptionWithPayments = await getSubscriptionWithPayments(subscriptionId);
      
      return res.json(subscriptionWithPayments);
    } catch (error) {
      console.error('Error getting subscription details:', error);
      return res.status(500).json({ error: 'Failed to get subscription details' });
    }
  });

  // Create migration for subscription_payments table if it doesn't exist
  app.post('/api/admin/create-payment-tables', async (req, res) => {
    try {
      // Check if table exists
      const tableExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'subscription_payments'
        );
      `);
      
      if (!tableExists.rows[0].exists) {
        // Create subscription_payments table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "subscription_payments" (
            "id" SERIAL PRIMARY KEY,
            "subscription_id" INTEGER NOT NULL REFERENCES "subscriptions"("id"),
            "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
            "stripe_invoice_id" TEXT UNIQUE,
            "stripe_payment_intent_id" TEXT UNIQUE,
            "amount" INTEGER NOT NULL,
            "currency" TEXT NOT NULL,
            "status" TEXT NOT NULL,
            "billing_reason" TEXT,
            "period_start" TIMESTAMP NOT NULL,
            "period_end" TIMESTAMP NOT NULL,
            "payment_method" TEXT,
            "receipt_url" TEXT,
            "created_at" TIMESTAMP DEFAULT NOW()
          );
        `);
        
        return res.json({ message: 'Payment tables created successfully' });
      } else {
        return res.json({ message: 'Payment tables already exist' });
      }
    } catch (error) {
      console.error('Error creating payment tables:', error);
      return res.status(500).json({ error: 'Failed to create payment tables' });
    }
  });

  // Get admin payment statistics
  app.get('/api/admin/payment-stats', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // First check if user is admin
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      // Get payment statistics
      const stats = await getPaymentStats();
      
      return res.json(stats);
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return res.status(500).json({ error: 'Failed to get payment statistics' });
    }
  });

  // Get all payments (admin only)
  app.get('/api/admin/all-payments', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // First check if user is admin
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      // Get all payments
      const payments = await db.query.subscriptionPayments.findMany({
        orderBy: (subscriptionPayments, { desc }) => [desc(subscriptionPayments.createdAt)],
      });
      
      return res.json({ payments });
    } catch (error) {
      console.error('Error getting all payments:', error);
      return res.status(500).json({ error: 'Failed to get payment data' });
    }
  });

  // Add an endpoint to make a user an admin 
  app.post('/api/admin/make-admin', async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      // Find the user by username
      const user = await db.query.users.findFirst({
        where: eq(users.username, username)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Update the user to be an admin
      await db.update(users)
        .set({ isAdmin: true })
        .where(eq(users.id, user.id));
      
      return res.json({ success: true, message: `User ${username} is now an admin` });
    } catch (error) {
      console.error('Error making user admin:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  });

  return { app, httpServer };
}