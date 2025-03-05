import { pgTable, text, serial, integer, timestamp, jsonb, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  profileType: text("profile_type").default("member"), // member, business, promoter, non-profit
  gender: text("gender"),
  bio: text("bio"),
  profileImage: text("profile_image"), 
  profileImages: jsonb("profile_images").$type<string[]>().default([]), 
  location: text("location"),
  birthLocation: text("birth_location"),
  nextLocation: text("next_location"),
  interests: jsonb("interests").$type<string[]>(),
  currentMoods: jsonb("current_moods").$type<string[]>(), 
  profession: text("profession"),
  age: integer("age"),
  businessName: text("business_name"), // for business/promoter profiles
  businessDescription: text("business_description"),
  websiteUrl: text("website_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  image: text("image"),
  image_url: text("image_url"), 
  category: text("category").notNull(),
  creatorId: integer("creator_id").references(() => users.id),
  capacity: integer("capacity"),
  ticketPrice: numeric("ticket_price"),
  ticketType: text("ticket_type").notNull(),
  availableTickets: integer("available_tickets"),
  createdAt: timestamp("created_at").defaultNow(),
  isPrivate: boolean("is_private").default(false),
  isBusinessEvent: boolean("is_business_event").default(false),
  tags: jsonb("tags").$type<string[]>().default([]),
  attendingCount: integer("attending_count").default(0),
  interestedCount: integer("interested_count").default(0),
});

export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull(), // attending, interested, not_attending
  ticketQuantity: integer("ticket_quantity").default(1),
  purchaseDate: timestamp("purchase_date"),
  ticketCode: text("ticket_code"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  createdEvents: many(events),
  participatingEvents: many(eventParticipants),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
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