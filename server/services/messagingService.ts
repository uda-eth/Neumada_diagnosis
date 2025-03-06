import { db } from '@db';
import { messages, users } from '@db/schema';
import { eq, and, desc, or } from 'drizzle-orm';
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
    where: or(
      eq(messages.senderId, userId),
      eq(messages.receiverId, userId)
    ),
    with: {
      sender: {
        columns: {
          id: true,
          fullName: true,
          profileImage: true,
          status: true
        }
      },
      receiver: {
        columns: {
          id: true,
          fullName: true,
          profileImage: true,
          status: true
        }
      }
    },
    orderBy: desc(messages.createdAt),
  });

  // Group messages by conversation
  const conversations = new Map();

  userMessages.forEach(message => {
    const otherId = message.senderId === userId ? message.receiverId : message.senderId;
    if (!conversations.has(otherId)) {
      conversations.set(otherId, {
        user: message.senderId === userId ? {
          id: message.receiver.id,
          name: message.receiver.fullName,
          image: message.receiver.profileImage,
          status: message.receiver.status
        } : {
          id: message.sender.id,
          name: message.sender.fullName,
          image: message.sender.profileImage,
          status: message.sender.status
        },
        lastMessage: message,
      });
    }
  });

  return Array.from(conversations.values());
}

export async function getMessages(userId: number, otherId: number) {
  return await db.query.messages.findMany({
    where: or(
      and(eq(messages.senderId, userId), eq(messages.receiverId, otherId)),
      and(eq(messages.senderId, otherId), eq(messages.receiverId, userId))
    ),
    with: {
      sender: {
        columns: {
          id: true,
          fullName: true,
          profileImage: true
        }
      },
      receiver: {
        columns: {
          id: true,
          fullName: true,
          profileImage: true
        }
      }
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