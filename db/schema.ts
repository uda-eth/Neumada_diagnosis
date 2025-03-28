import { pgTable, text, serial, integer, timestamp, jsonb, boolean, varchar, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Declare table first
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  profileType: text("profile_type").default("member"), // member, business, promoter, non-profit
  gender: text("gender"), // Added for gender filtering
  sexualOrientation: text("sexual_orientation"), // Added for orientation filtering
  bio: text("bio"),
  profileImage: text("profile_image"), 
  profileImages: jsonb("profile_images").$type<string[]>().default([]), 
  location: text("location"), // Current location
  birthLocation: text("birth_location"),
  nextLocation: text("next_location"),
  interests: jsonb("interests").$type<string[]>(),
  currentMoods: jsonb("current_moods").$type<string[]>(), // Filter by mood
  profession: text("profession"),
  age: integer("age"),
  businessName: text("business_name"), // for business/promoter profiles
  businessDescription: text("business_description"),
  websiteUrl: text("website_url"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active"), // For showing active users
  isPremium: boolean("is_premium").default(false), // For premium features
  preferredLanguage: text("preferred_language").default("en"), // Language preference
  referralCode: text("referral_code").unique(), // For referral system
  referredBy: integer("referred_by"), // Will set up relation later to avoid circular dep
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  city: text("city").notNull(), // For city filtering
  location: text("location").notNull(), // Specific venue location
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"), // Added for multi-day events
  image: text("image"),
  image_url: text("image_url"), 
  category: text("category").notNull(),
  creatorId: integer("creator_id").references(() => users.id),
  capacity: integer("capacity"),
  price: varchar("price"), 
  ticketType: text("ticket_type").notNull(), // free, paid, donation
  availableTickets: integer("available_tickets"),
  createdAt: timestamp("created_at").defaultNow(),
  isPrivate: boolean("is_private").default(false),
  isBusinessEvent: boolean("is_business_event").default(false),
  isDraft: boolean("is_draft").default(false), // Added for draft functionality
  tags: jsonb("tags").$type<string[]>().default([]),
  attendingCount: integer("attending_count").default(0),
  interestedCount: integer("interested_count").default(0),
  timeFrame: text("time_frame"), // Today, This Week, This Weekend, This Month, Next Month
  stripeProductId: text("stripe_product_id"), // For payment integration
  stripePriceId: text("stripe_price_id"), // For payment integration
});

export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull(), // attending, interested, not_attending
  ticketQuantity: integer("ticket_quantity").default(1),
  purchaseDate: timestamp("purchase_date"),
  ticketCode: text("ticket_code"),
  paymentStatus: text("payment_status").default("pending"), // pending, completed, refunded
  paymentIntentId: text("payment_intent_id"), // For Stripe integration
  checkInStatus: boolean("check_in_status").default(false), // For event check-in
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  language: text("language").default("en"), // For message translation
});

// New table for user connections/follows
export const userConnections = pgTable("user_connections", {
  followerId: integer("follower_id").references(() => users.id),
  followingId: integer("following_id").references(() => users.id),
  status: text("status").default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  };
});

// Table for invitations/referrals
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  inviterId: integer("inviter_id").references(() => users.id),
  email: text("email").notNull(),
  code: text("code").notNull().unique(),
  status: text("status").default("pending"), // pending, accepted, expired
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  inviteeId: integer("invitee_id").references(() => users.id), // Set when accepted
});

// Table for user cities (cities user is interested in)
// Also used for tracking city suggestions from non-users
export const userCities = pgTable("user_cities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  city: text("city").notNull(),
  isCurrent: boolean("is_current").default(false),
  isPrimary: boolean("is_primary").default(false),
  isActive: boolean("is_active").default(true), // For suggestions: false = not shown in UI
  email: text("email"), // For suggestions: email to notify when city is added
  reason: text("reason"), // For suggestions: why this city should be added
  arrivalDate: timestamp("arrival_date"),
  departureDate: timestamp("departure_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many, one }) => ({
  createdEvents: many(events),
  participatingEvents: many(eventParticipants),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  followers: many(userConnections, { relationName: "followers" }),
  following: many(userConnections, { relationName: "following" }),
  sentInvitations: many(invitations, { relationName: "sentInvitations" }),
  referredBy: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
  userCities: many(userCities),
}));

export const eventRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  participants: many(eventParticipants),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, {
    fields: [eventParticipants.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventParticipants.userId],
    references: [users.id],
  }),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));

export const userConnectionsRelations = relations(userConnections, ({ one }) => ({
  follower: one(users, {
    fields: [userConnections.followerId],
    references: [users.id],
    relationName: "following",
  }),
  following: one(users, {
    fields: [userConnections.followingId],
    references: [users.id],
    relationName: "followers",
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  inviter: one(users, {
    fields: [invitations.inviterId],
    references: [users.id],
    relationName: "sentInvitations",
  }),
  invitee: one(users, {
    fields: [invitations.inviteeId],
    references: [users.id],
  }),
}));

export const userCitiesRelations = relations(userCities, ({ one }) => ({
  user: one(users, {
    fields: [userCities.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export const insertEventParticipantSchema = createInsertSchema(eventParticipants);
export const selectEventParticipantSchema = createSelectSchema(eventParticipants);
export type EventParticipant = typeof eventParticipants.$inferSelect;
export type NewEventParticipant = typeof eventParticipants.$inferInsert;

export const insertUserConnectionSchema = createInsertSchema(userConnections);
export const selectUserConnectionSchema = createSelectSchema(userConnections);
export type UserConnection = typeof userConnections.$inferSelect;
export type NewUserConnection = typeof userConnections.$inferInsert;

export const insertInvitationSchema = createInsertSchema(invitations);
export const selectInvitationSchema = createSelectSchema(invitations);
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

export const insertUserCitySchema = createInsertSchema(userCities);
export const selectUserCitySchema = createSelectSchema(userCities);
export type UserCity = typeof userCities.$inferSelect;
export type NewUserCity = typeof userCities.$inferInsert;