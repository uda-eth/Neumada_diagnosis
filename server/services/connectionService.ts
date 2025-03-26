
import { db } from "../../db";
import { connections } from "../../db/schema";
import { eq, and, or } from "drizzle-orm";

export async function sendConnectionRequest(requesterId: number, recipientId: number) {
  try {
    const result = await db.insert(connections).values({
      requesterId,
      recipientId,
      status: "pending"
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Error sending connection request:", error);
    throw error;
  }
}

export async function updateConnectionStatus(connectionId: number, status: "accepted" | "declined") {
  try {
    const result = await db
      .update(connections)
      .set({ status, updatedAt: new Date() })
      .where(eq(connections.id, connectionId))
      .returning();
    return result[0];
  } catch (error) {
    console.error("Error updating connection status:", error);
    throw error;
  }
}

export async function getUserConnections(userId: number) {
  try {
    return await db
      .select()
      .from(connections)
      .where(
        and(
          or(
            eq(connections.requesterId, userId),
            eq(connections.recipientId, userId)
          ),
          eq(connections.status, "accepted")
        )
      );
  } catch (error) {
    console.error("Error getting user connections:", error);
    throw error;
  }
}

export async function getPendingRequests(userId: number) {
  try {
    return await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.recipientId, userId),
          eq(connections.status, "pending")
        )
      );
  } catch (error) {
    console.error("Error getting pending requests:", error);
    throw error;
  }
}
