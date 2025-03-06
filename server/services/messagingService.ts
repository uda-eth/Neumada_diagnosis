import { db } from '@db';
import { messages, users } from '@db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Message } from '@db/schema';

export interface SendMessageParams {
  senderId: number;
  receiverId: number;
  content: string;
}

export async function sendMessage({ senderId, receiverId, content }: SendMessageParams) {
  return await db.insert(messages).values({
    senderId,
    receiverId,
    content,
    isRead: false,
  }).returning();
}

export async function getConversations(userId: number) {
  // Get all messages where user is either sender or receiver
  const userMessages = await db.query.messages.findMany({
    where: and(
      eq(messages.senderId, userId),
      eq(messages.receiverId, userId)
    ),
    with: {
      sender: true,
      receiver: true,
    },
    orderBy: desc(messages.createdAt),
  });

  // Group messages by conversation
  const conversations = new Map();
  
  userMessages.forEach(message => {
    const otherId = message.senderId === userId ? message.receiverId : message.senderId;
    if (!conversations.has(otherId)) {
      conversations.set(otherId, {
        user: message.senderId === userId ? message.receiver : message.sender,
        lastMessage: message,
      });
    }
  });

  return Array.from(conversations.values());
}

export async function getMessages(userId: number, otherId: number) {
  return await db.query.messages.findMany({
    where: and(
      eq(messages.senderId, userId),
      eq(messages.receiverId, otherId)
    ),
    with: {
      sender: true,
      receiver: true,
    },
    orderBy: desc(messages.createdAt),
  });
}

export async function markMessageAsRead(messageId: number) {
  return await db.update(messages)
    .set({ isRead: true })
    .where(eq(messages.id, messageId))
    .returning();
}

export async function markAllMessagesAsRead(userId: number) {
  return await db.update(messages)
    .set({ isRead: true })
    .where(eq(messages.receiverId, userId))
    .returning();
}
