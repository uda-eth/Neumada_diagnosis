import { db } from "../../db";
import { 
  messages, 
  users, 
  userConnections, 
  Message, 
  NewMessage 
} from "../../db/schema";
import { eq, and, or, desc, asc } from "drizzle-orm";

// Send a message (only between connected users)
export async function sendMessage({ senderId, receiverId, content }: {
  senderId: number;
  receiverId: number;
  content: string;
}) {
  // Check if users are connected
  const connectionExists = await db.query.userConnections.findFirst({
    where: or(
      and(
        eq(userConnections.followerId, senderId),
        eq(userConnections.followingId, receiverId),
        eq(userConnections.status, "accepted")
      ),
      and(
        eq(userConnections.followerId, receiverId),
        eq(userConnections.followingId, senderId),
        eq(userConnections.status, "accepted")
      )
    )
  });

  if (!connectionExists) {
    throw new Error("Users must be connected to send messages");
  }

  // Create the message
  const newMessage: NewMessage = {
    senderId,
    receiverId,
    content,
    createdAt: new Date(),
    isRead: false
  };

  const result = await db.insert(messages).values(newMessage).returning();

  // Get sender info for notification purposes
  const sender = await db.query.users.findFirst({
    where: eq(users.id, senderId),
    columns: {
      id: true,
      fullName: true,
      profileImage: true
    }
  });

  // Return the message with sender info without modifying result directly
  if (result.length > 0 && sender) {
    return [{
      ...result[0],
      sender
    }];
  }

  return result;
}

// Get conversations for a user
export async function getConversations(userId: number) {
  // Get all connected users
  const connections = await db.query.userConnections.findMany({
    where: or(
      and(
        eq(userConnections.followerId, userId),
        eq(userConnections.status, "accepted")
      ),
      and(
        eq(userConnections.followingId, userId),
        eq(userConnections.status, "accepted")
      )
    ),
    with: {
      follower: true,
      following: true
    }
  });

  // Extract all connected user IDs
  const connectedUserIds = new Set<number>();
  connections.forEach(conn => {
    if (conn.followerId === userId && conn.followingId) {
      connectedUserIds.add(conn.followingId);
    } else if (conn.followingId === userId && conn.followerId) {
      connectedUserIds.add(conn.followerId);
    }
  });

  // Get all messages where user is either sender or receiver
  const userMessages = await db.query.messages.findMany({
    where: or(
      eq(messages.senderId, userId),
      eq(messages.receiverId, userId)
    ),
    orderBy: [desc(messages.createdAt)],
    with: {
      sender: {
        columns: {
          id: true,
          fullName: true,
          username: true,
          profileImage: true
        }
      },
      receiver: {
        columns: {
          id: true,
          fullName: true,
          username: true,
          profileImage: true
        }
      }
    }
  });

  // Group messages by conversation partner
  const conversationMap = new Map<number, {
    user: {
      id: number;
      name: string | null;
      username?: string;
      image: string | null;
    };
    lastMessage: Message;
    messages: Message[];
  }>();

  for (const message of userMessages) {
    // Determine if user is sender or receiver
    const isUserSender = message.senderId === userId;
    const partnerId = isUserSender ? message.receiverId : message.senderId;

    // Skip if any IDs are null
    if (partnerId === null) continue;

    // Only include conversations with connected users
    if (!connectedUserIds.has(partnerId)) continue;

    // Get partner info
    const partner = isUserSender ? message.receiver : message.sender;

    if (!partner) continue;

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        user: {
          id: partnerId,
          name: partner.fullName,
          username: partner.username,
          image: partner.profileImage
        },
        lastMessage: message,
        messages: [message]
      });
    } else {
      const conversation = conversationMap.get(partnerId)!;
      conversation.messages.push(message);

      // Update last message if this one is newer
      const msgDate = message.createdAt ? new Date(message.createdAt) : new Date();
      const lastMsgDate = conversation.lastMessage.createdAt ? new Date(conversation.lastMessage.createdAt) : new Date();

      if (msgDate > lastMsgDate) {
        conversation.lastMessage = message;
      }
    }
  }

  // Convert map to array and format for client
  const conversations = Array.from(conversationMap.values()).map(conv => {
    // Calculate unread count
    const unreadCount = conv.messages.filter(
      msg => msg.receiverId === userId && !msg.isRead
    ).length;

    return {
      user: conv.user,
      lastMessage: conv.lastMessage,
      unreadCount
    };
  });

  // Sort by last message date (newest first)
  return conversations.sort((a, b) => {
    const dateA = a.lastMessage.createdAt ? new Date(a.lastMessage.createdAt) : new Date();
    const dateB = b.lastMessage.createdAt ? new Date(b.lastMessage.createdAt) : new Date();
    return dateB.getTime() - dateA.getTime();
  });
}

// Get messages between two users
export async function getMessages(userId: number, otherId: number) {
  // Check if users are connected
  const connectionExists = await db.query.userConnections.findFirst({
    where: or(
      and(
        eq(userConnections.followerId, userId),
        eq(userConnections.followingId, otherId),
        eq(userConnections.status, "accepted")
      ),
      and(
        eq(userConnections.followerId, otherId),
        eq(userConnections.followingId, userId),
        eq(userConnections.status, "accepted")
      )
    )
  });

  if (!connectionExists) {
    throw new Error("Users must be connected to view messages");
  }

  return db.query.messages.findMany({
    where: or(
      and(
        eq(messages.senderId, userId),
        eq(messages.receiverId, otherId)
      ),
      and(
        eq(messages.senderId, otherId),
        eq(messages.receiverId, userId)
      )
    ),
    orderBy: [asc(messages.createdAt)],
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
    }
  });
}

// Mark a message as read
export async function markMessageAsRead(messageId: number) {
  await db
    .update(messages)
    .set({ isRead: true })
    .where(eq(messages.id, messageId));

  // Return the updated message
  return db.query.messages.findFirst({
    where: eq(messages.id, messageId)
  });
}

// Mark all messages as read for a user
export async function markAllMessagesAsRead(userId: number) {
  // Only mark messages where user is the receiver
  return db
    .update(messages)
    .set({ isRead: true })
    .where(eq(messages.receiverId, userId));
}